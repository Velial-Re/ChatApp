using System;
using Chat.Models;
    
namespace Chat.Models
{
    public class VoiceChatParticipant
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; }
        public Guid VoiceChatRoomId { get; set; }
        public virtual VoiceChatRoom VoiceChatRoom { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}