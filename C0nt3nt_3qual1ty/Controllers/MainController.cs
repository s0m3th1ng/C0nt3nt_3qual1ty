using C0nt3nt_3qual1ty.Utils;
using Microsoft.AspNetCore.Mvc;

namespace C0nt3nt_3qual1ty.Controllers
{
    [Route("[controller]")]
    public class MainController : Controller
    {
        private readonly UrlParser _parser = new();
        
        public string Get(string url)
        {
            var result = _parser.ParseUrl(url);
            return result;
        }
    }
}