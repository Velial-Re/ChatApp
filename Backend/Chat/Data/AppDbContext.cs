using Microsoft.EntityFrameworkCore;
using Chat.Models;

namespace Chat.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<VoiceChatRoom> VoiceChatRooms { get; set; }
        public DbSet<VoiceChatParticipant> VoiceChatParticipants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<ChatRoom>()
                .HasIndex(cr => cr.Name)
                .IsUnique();
            
            modelBuilder.Entity<ChatRoom>()
                .HasMany(cr => cr.Users)
                .WithMany(u => u.ChatRooms)
                .UsingEntity(j => j.ToTable("UserChatRoom"));

            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.ChatRoom)
                .WithMany(cr => cr.Messages)
                .HasForeignKey(m => m.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            // для голосового чата
            modelBuilder.Entity<VoiceChatRoom>()
                .HasMany(vcr => vcr.Participants)
                .WithOne(vp => vp.VoiceChatRoom)
                .HasForeignKey(vp => vp.VoiceChatRoomId);

            modelBuilder.Entity<VoiceChatParticipant>()
                .HasKey(vp => new { vp.UserId, vp.VoiceChatRoomId });

            modelBuilder.Entity<VoiceChatParticipant>()
                .HasOne(vp => vp.User)
                .WithMany()
                .HasForeignKey(vp => vp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<VoiceChatParticipant>()
                .HasOne(vp => vp.VoiceChatRoom)
                .WithMany(vcr => vcr.Participants)
                .HasForeignKey(vp => vp.VoiceChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}