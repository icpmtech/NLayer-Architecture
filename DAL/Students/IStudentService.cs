
using DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dal.Services.Students
{
    public interface IStudentDALService

    {
        Task<Student> CreateStudentsAsync(Student student);
        Task<IList<Student>> ReadStudentsAsync();
        Task<Student> UpdateStudentAsync(Student student);
        Task<Student> DeleteStudentsAsync(int id);
    }
}