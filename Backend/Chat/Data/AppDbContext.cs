using Microsoft.EntityFrameworkCore;
using Chat.Models;

namespace Chat.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<ChatRoom> ChatRooms { get; set; }

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
            .HasOne(mes => mes.User)
            .WithMany()
            .HasForeignKey(mes => mes.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(mes => mes.ChatRoom)
            .WithMany(cr => cr.Messages)
            .HasForeignKey(mes => mes.ChatRoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}