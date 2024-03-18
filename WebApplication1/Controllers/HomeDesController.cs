using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApplication1.Controllers
{
    public class HomeDesController : Controller
    {
      
        public ActionResult IndexDes()
        {
         ServiceReferenceSOA1.ServiceClient service=new ServiceReferenceSOA1.ServiceClient();
         var res=   service.GetData(0);
            return View();
        }

       
    }
}