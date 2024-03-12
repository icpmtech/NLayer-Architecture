using Microsoft.Owin;
using Owin;
using System;
using Hangfire;
using System.Collections.Generic;
using System.Diagnostics;
using System.Configuration;

[assembly: OwinStartup(typeof(WebApplication1.Startup))]
namespace WebApplication1
{
    public class Startup
    {
        private IEnumerable<IDisposable> GetHangfireServers()
        {
            var connectionStringHangFireContext = ConfigurationManager.ConnectionStrings["HangFireContext"].ToString();

            GlobalConfiguration.Configuration
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(connectionStringHangFireContext);

            yield return new BackgroundJobServer();
        }

        public void Configuration(IAppBuilder app)
        {
            app.UseHangfireAspNet(GetHangfireServers);
            app.UseHangfireDashboard();
            app.UseHangfireServer();

        }
    }
}
