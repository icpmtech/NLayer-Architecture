using Services.Pocos;

namespace Services.Students
{
    public interface IStudentService
    {
        Task<StudentDTO> CreateStudentsAsync(StudentDTO student);
        Task<IEnumerable<StudentDTO>> ReadStudentsAsync();
        Task<StudentDTO> UpdateStudentAsync(StudentDTO student);
        Task<StudentDTO> DeleteStudentsAsync(int id);
    }
}