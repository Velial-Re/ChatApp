using System;
using System.Collections.Generic;
using Chat.Models;

namespace Chat.Models
{
    public class VoiceChatRoom
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid ChatRoomId { get; set; }
    public virtual ChatRoom ChatRoom { get; set; } = null!;
    public virtual ICollection<VoiceChatParticipant> Participants { get; set; } = new List<VoiceChatParticipant>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
}