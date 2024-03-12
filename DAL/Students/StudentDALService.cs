

using DAL.Entities;
using Infrastruture.Context;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;

namespace Dal.Services.Students
{
    public class StudentDALService : IStudentDALService
    { 
        SchoolContext _schoolContext=new SchoolContext();

        public async Task<Student> CreateStudentsAsync(Student student)
        {
            throw new System.NotImplementedException();
        }

        public Task<Student> DeleteStudentsAsync(int id)
        {
            throw new System.NotImplementedException();
        }

      

        public async Task<IList<Student>> ReadStudentsAsync()
        {
            return (IList<Student>)await _schoolContext.Students.ToListAsync();
        }

      

        public Task<Student> UpdateStudentAsync(Student student)
        {
            throw new System.NotImplementedException();
        }
    }
}
