using System;
using System.Linq;
using C0nt3nt_3qual1ty.Models;
using C0nt3nt_3qual1ty.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace C0nt3nt_3qual1ty.Controllers
{
    [Route("[controller]")]
    public class MainController : Controller
    {
        private readonly UrlParser _parser;
        private DatabaseContext _db;

        public MainController(DatabaseContext context)
        {
            _db = context;
            _parser = new UrlParser();
        }
        
        public string Get(string url)
        {
            /*
             TODO: Check if record already exist
             Check different equality examples
            */
            ParsedPage page;
            try
            {
                page = _parser.ParseUrl(url);
            }
            catch (NullReferenceException e)
            {
                return JsonConvert.SerializeObject(e.Message);
            }
            
            _db.Pages.Add(page);
            _db.SaveChanges();
            return JsonConvert.SerializeObject(_db.Pages.ToArray().Last());
        }
    }
}