using System.IO;
using Microsoft.Extensions.Configuration;

namespace C0nt3nt_3qual1ty
{
    public static class Config
    {
        private static readonly IConfiguration Configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("config.json")
            .Build();

        public static string Get(string key)
        {
            return Configuration[key];
        }
    }
}