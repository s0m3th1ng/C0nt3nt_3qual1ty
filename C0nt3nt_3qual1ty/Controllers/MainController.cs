using System;
using System.Collections.Generic;
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
        private const string DatabaseError = "Database contains this url";
        private readonly UrlParser _parser;
        private readonly DatabaseContext _db;

        public MainController(DatabaseContext context)
        {
            _db = context;
            _parser = new UrlParser();
        }

        [HttpGet]
        public string Get()
        {
            return JsonConvert.SerializeObject(_db.Pages.ToArray());
        }

        [HttpGet("[action]")]
        public string GetEquality()
        {
            return JsonConvert.SerializeObject(Config.Get("EqualityEdge"));
        }
        
        [HttpPost]
        public string Post([FromBody] string[] urls)
        {
            /*
             TODO: Check if record already exist
             Check different equality examples
            */

            List<PostUrlResponse> addedUrls = new List<PostUrlResponse>();

            foreach (string url in urls)
            {
                TryAddUrl(addedUrls, url);
            }
            return JsonConvert.SerializeObject(addedUrls.ToArray());
        }

        private void TryAddUrl(List<PostUrlResponse> addedUrls, string url)
        {
            try
            {
                _parser.SetUrl(url);
                string fullUrl = _parser.GetFullUrl();
                if (DbContainsUrl(fullUrl))
                {
                    PostUrlResponse containedPage = new PostUrlResponse(fullUrl, DatabaseError);
                    addedUrls.Add(containedPage);
                    return;
                }
                ParsedPage page = _parser.ParseUrl();
                AddToDb(page);
                PostUrlResponse addedPage = new PostUrlResponse(fullUrl, page);
                addedUrls.Add(addedPage);
            }
            catch (NullReferenceException e)
            {
                PostUrlResponse brokenPage = new PostUrlResponse(url, e.Message);
                addedUrls.Add(brokenPage);
            }
        }

        private bool DbContainsUrl(string url)
        {
            return _db.Pages.FirstOrDefault(p => Equals(p.Url, url)) != null;
        }

        private void AddToDb(ParsedPage page)
        {
            _db.Pages.Add(page);
            _db.SaveChanges();
        }
    }
}