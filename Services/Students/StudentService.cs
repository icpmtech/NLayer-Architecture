using Dal.Services.Students;
using Infrastruture.Context;
using Services.Pocos;

namespace Services.Students
{
    public class StudentService : IStudentService
    {
        private IStudentDALService studentDALService = new StudentDALService();
        public Task<StudentDTO> CreateStudentsAsync(StudentDTO student)
        {
            throw new NotImplementedException();
        }

        public Task<StudentDTO> DeleteStudentsAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<StudentDTO>> ReadStudentsAsync()
        {
           var students= studentDALService.ReadStudentsAsync().Result;
           var studentsDTO = students.Select(studant => new StudentDTO { Name = studant.StudentName });

            return (IEnumerable<StudentDTO>)students;
        }

        public Task<StudentDTO> UpdateStudentAsync(StudentDTO student)
        {
            throw new NotImplementedException();
        }
    }
}
