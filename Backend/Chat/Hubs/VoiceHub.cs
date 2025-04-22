using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Chat.Hubs
{
    public class VoiceHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> VoiceRooms = new();
        private static readonly ConcurrentDictionary<string, string> UserRooms = new();

        public async Task JoinVoiceChat(string roomId, string username)
        {
            VoiceRooms.TryAdd(Context.ConnectionId, roomId);
            UserRooms.TryAdd(Context.ConnectionId, username);

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.OthersInGroup(roomId).SendAsync("UserJoinedVoice", username);
        }
        
        public async Task LeaveVoiceChat(string roomId, string username)
        {
            VoiceRooms.TryRemove(Context.ConnectionId, out _);
            UserRooms.TryRemove(Context.ConnectionId, out _);
            
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.OthersInGroup(roomId).SendAsync("UserLeftVoice", username);
        }

        public async Task SendVoiceSignal(string targetUserId, object signal)
        {
            await Clients.User(targetUserId).SendAsync("ReceiveVoiceSignal", Context.ConnectionId, signal);
        }

        public override async Task OnDisconnectedAsync(Exception? exception) 
        {
            if (VoiceRooms.TryGetValue(Context.ConnectionId, out var roomId) && 
                UserRooms.TryGetValue(Context.ConnectionId, out var username))
            {
                await Clients.OthersInGroup(roomId).SendAsync("UserLeftVoice", username);
            }

            VoiceRooms.TryRemove(Context.ConnectionId, out _);
            UserRooms.TryRemove(Context.ConnectionId, out _);

            await base.OnDisconnectedAsync(exception);
        }
    }
}