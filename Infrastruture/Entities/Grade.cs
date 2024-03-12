using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;

namespace Infrastruture.Entities
{
    public class Grade
    {
        public int GradeId { get; set; }
        public string GradeName { get; set; }
        public string Section { get; set; }

        public ICollection<Student> Students { get; set; }
    }
}