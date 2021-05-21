using Microsoft.EntityFrameworkCore;

namespace C0nt3nt_3qual1ty.Models
{
    public class DatabaseContext : DbContext
    {
        public DbSet<ParsedPage> Pages { get; set; }

        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
        { }
    }
}