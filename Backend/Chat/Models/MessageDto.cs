namespace Chat.Models;

public class MessageDto
{
    public string Content { get; set; }
    public string UserName { get; set; }
    public DateTime SentAt { get; set; }
}