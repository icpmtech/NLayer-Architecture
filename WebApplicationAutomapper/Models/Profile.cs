namespace WebApplicationAutomapper.Models
{
    using AutoMapper;

    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDto>();
            // Feel free to add more mappings here
        }
    }
}
