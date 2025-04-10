using Chat.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chat.Controllers;

[ApiController]
[Route("api/database")]
public class DatabaseController : ControllerBase
{
    private readonly AppDbContext _context;

    public DatabaseController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("tables")]
    public async Task<IActionResult> GetAllTables()
    {
        try
        {
            Console.WriteLine("Запрос к /api/database/tables получен");
            var tables = await _context.Database
                .SqlQueryRaw<string>(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                )
                .ToListAsync();

            Console.WriteLine($"Найдены таблицы: {string.Join(", ", tables)}");
            return Ok(tables);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка: {ex}");
            return StatusCode(500, "Internal server error");
        }
    }
}
