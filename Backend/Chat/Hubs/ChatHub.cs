using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Chat.Data;
using Chat.Models;
using Microsoft.AspNetCore.Authorization;

namespace Chat.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(string userName, string message, string messageId);
    Task UserJoined(string userName);
    Task UserLeft(string userName);
    Task UpdateChatList();
}

[Authorize]
public class ChatHub : Hub<IChatClient>
{
    private readonly IDistributedCache _cache;
    private readonly AppDbContext _dbContext;

    public ChatHub(IDistributedCache cache, AppDbContext dbContext)
    {
        _cache = cache;
        _dbContext = dbContext;
    }

    public async Task JoinChat(UserConnection connection, bool isSwitching = false)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            throw new HubException("Не авторизован");
        }

        var user = await _dbContext.Users
            .Include(u => u.ChatRooms)
            .FirstOrDefaultAsync(u => u.Id == userGuid);

        if (user == null) throw new HubException("Пользователь не найден");

        var room = await _dbContext.ChatRooms.FirstOrDefaultAsync(cr => cr.Name == connection.ChatRoom);

        if (room == null) throw new HubException("Комната не найдена");

        var inChat = user.ChatRooms.Contains(room);

        if (!inChat)
        {
            user.ChatRooms.Add(room);
            await _dbContext.SaveChangesAsync();
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, room.Name);
        await _cache.SetStringAsync(Context.ConnectionId, $"{user.Id}|{room.Id}");

        if (!isSwitching && !inChat)
        {
            await Clients.Group(connection.ChatRoom).UserJoined(connection.UserName);
            await SaveMessage(user.Id, room.Id, $"{connection.UserName} joined the chat", Guid.NewGuid());
        }
    }

    public async Task SendMessage(string message, string messageId)
    {
        Console.WriteLine($"Attempting to send message: {message} (ID: {messageId})");
        var cacheData = await _cache.GetStringAsync(Context.ConnectionId);

        if (string.IsNullOrEmpty(cacheData))
        {
            Console.WriteLine("No cache data found");
            return;
        }

        var parts = cacheData.Split('|');
        if (parts.Length != 2)
        {
            Console.WriteLine("Invalid cache data format");
            return;
        }

        if (!Guid.TryParse(parts[0], out var userId) || !Guid.TryParse(parts[1], out var roomId))
        {
            Console.WriteLine("Invalid GUID format in cache");
            return;
        }

        var user = await _dbContext.Users.FindAsync(userId);
        var room = await _dbContext.ChatRooms.FindAsync(roomId);

        if (user == null || room == null)
        {
            Console.WriteLine("User or room not found");
            return;
        }

        try
        {
            await SaveMessage(userId, roomId, message, Guid.Parse(messageId));


            await Clients.Group(room.Name).ReceiveMessage(user.UserName, message, messageId);
            Console.WriteLine($"Message sent to group '{room.Name}'");
            await Clients.Group(room.Name).UpdateChatList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending message: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateChatList()
    {
        var cacheData = await _cache.GetStringAsync(Context.ConnectionId);
        if (!string.IsNullOrEmpty(cacheData))
        {
            var parts = cacheData.Split('|');
            if (parts.Length == 2 && Guid.TryParse(parts[0], out var userId) && Guid.TryParse(parts[1], out var roomId))
            {
                await Clients.Group(roomId.ToString()).UpdateChatList();
            }
        }
    }

    private async Task SaveMessage(Guid userId, Guid roomId, string content, Guid messageId)
    {
        var message = new Message
        {
            Id = messageId,
            UserId = userId,
            ChatRoomId = roomId,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        _dbContext.Messages.Add(message);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<MessageDto>> GetChatHistory(string chatRoomName)
    {
        var room = await _dbContext.ChatRooms.FirstOrDefaultAsync(fr => fr.Name == chatRoomName);

        if (room == null) return new List<MessageDto>();

        return await _dbContext.Messages
            .Where(m => m.ChatRoomId == room.Id)
            .OrderBy(m => m.SentAt)
            .Include(m => m.User)
            .Select(m => new MessageDto
            {
                UserName = m.User.UserName,
                Content = m.Content,
                SentAt = m.SentAt
            })
            .ToListAsync();
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            Context.Abort();
            return;
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            var cacheData = await _cache.GetStringAsync(Context.ConnectionId);
            if (!string.IsNullOrEmpty(cacheData))
            {
                var parts = cacheData.Split('|');
                if (parts.Length == 2 && Guid.TryParse(parts[0], out var userId) &&
                    Guid.TryParse(parts[1], out var roomId))
                {
                    var user = await _dbContext.Users.FindAsync(userId);
                    var room = await _dbContext.ChatRooms.FindAsync(roomId);

                    if (user != null && room != null)
                    {
                        await Clients.Group(room.Name).UserLeft(user.UserName);
                        await SaveMessage(user.Id, room.Id, $"{user.UserName} left the chat", Guid.NewGuid());
                    }
                }

                await _cache.RemoveAsync(Context.ConnectionId);
            }
        }


        await base.OnDisconnectedAsync(exception);
    }
}