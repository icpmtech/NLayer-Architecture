namespace WebApplicationCoreService
{
   
        public class ServiceOrder : IServiceOrder
        {
            // Example property
            public int OrderId { get; set; }

            // Example method
            public void ProcessOrder()
            {
                // Implementation code here
            }
        }

        public interface IServiceOrder
        {
            int OrderId { get; set; }
            void ProcessOrder();
        }
    
}
