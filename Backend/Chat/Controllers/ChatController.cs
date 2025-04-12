using System.Security.Claims;
using Chat.Data;
using Chat.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chat.Controllers;

[ApiController]
[Route("api/chats")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ChatController> _logger;

    public ChatController(AppDbContext context, ILogger<ChatController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetUserChats()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();
        try
        {
            var chats = await _context.ChatRooms
                .Include(cr => cr.Users)
                .Include(cr => cr.Messages)
                .Where(cr => cr.Users.Any(u => u.Id == userGuid))
                .ToListAsync();
            var result = chats.Select(cr => new
            {
                cr.Id,
                cr.Name,
                LastMessage = cr.Messages
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => m.Content)
                    .FirstOrDefault()
            }).ToList();

            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting user chats");
            return StatusCode(500, $"Internal server error: {e.Message}");
        }
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreateChat([FromBody] CreateChatRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Chat name cannot be empty");

            if (await _context.ChatRooms.AnyAsync(cr => cr.Name == request.Name))
                return BadRequest("Chat with this name already exists");

            var user = await _context.Users.FindAsync(userGuid);
            if (user == null) return Unauthorized();

            var chatRoom = new ChatRoom
            {
                Name = request.Name,
                CreatedAt = DateTime.UtcNow
            };
            chatRoom.Users.Add(user);

            _context.ChatRooms.Add(chatRoom);
            await _context.SaveChangesAsync();

            return Ok(new { chatRoom.Id, chatRoom.Name });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating chat");
            return StatusCode(500, "Error creating chat");
        }
    }
}

public class CreateChatRequest
{
    public string Name { get; set; } = string.Empty;
}