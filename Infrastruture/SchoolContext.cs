namespace Infrastruture.Context
{
    using Infrastruture.Entities;
    using System.Data.Entity;

    public class SchoolContext : DbContext
    {
        public SchoolContext() : base("SchoolContext")
        {

        }

        public DbSet<Student> Students { get; set; }
        public DbSet<Grade> Grades { get; set; }
    }
}