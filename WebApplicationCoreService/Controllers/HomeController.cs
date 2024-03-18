using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using WebApplicationCoreService.Models;

namespace WebApplicationCoreService.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private readonly IServiceOrder _ServiceOrder;

        public HomeController(ILogger<HomeController> logger, IServiceOrder serviceOrder)
        {
            _logger = logger;
            _ServiceOrder = serviceOrder;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
