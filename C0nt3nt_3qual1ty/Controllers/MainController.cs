using System;
using System.Collections.Generic;
using System.Linq;
using C0nt3nt_3qual1ty.Models;
using C0nt3nt_3qual1ty.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RestSharp;
using RestSharp.Authenticators;

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
        public string GetUniqueness()
        {
            return JsonConvert.SerializeObject(Config.Get("UniquenessEdge"));
        }

        [HttpGet("[action]")]
        public string GetCharacterCount()
        {
            return JsonConvert.SerializeObject(_parser.GetTranslatorLimit());
        }

        [HttpGet("[action]")]
        public string DownloadHtml(int id)
        {
            ParsedPage toDownload = _db.Pages.Find(id);
            return toDownload.Html;
        }
        
        [HttpGet("[action]")]
        public string AddingDone(string email)
        {
            string apiKey = Config.Get("ApiKeys:EmailKey");
            RestClient client = new RestClient
            {
                BaseUrl = new Uri("https://api.mailgun.net/v3"),
                Authenticator = new HttpBasicAuthenticator("api",
                    apiKey)
            };
            RestRequest request = new RestRequest ();
            request.AddParameter ("domain", "mx.monitask.net", ParameterType.UrlSegment);
            request.Resource = "{domain}/messages";
            request.AddParameter ("from", "C0nt3nt 3qual1ty <notification@mx.monitask.net>");
            request.AddParameter ("to", email);
            request.AddParameter ("subject", "Come back soon");
            request.AddParameter ("text", "Adding urls completed!");
            request.Method = Method.POST;
            client.Execute(request);
            return null;
        }

        [HttpPost]
        public string Post([FromBody] string[] urls)
        {
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

        [HttpPost("[action]")]
        public string UpdateRecord([FromBody] ParsedPage page)
        {
            _db.Pages.Update(page ?? throw new InvalidOperationException());
            _db.SaveChanges();
            return JsonConvert.SerializeObject("Record saved");
        }

        [HttpPost("[action]")]
        public string TranslateRecord([FromBody] ParsedPage page)
        {
            PostTranslationResponse result;
            try
            {
                string translation = _parser.GetPageTranslation(page.Html);
                result = new PostTranslationResponse {Error = false, Text = translation};
                page.Translated = true;
                page.Html = translation;
                _db.Pages.Update(page);
                _db.SaveChanges();
            }
            catch (NullReferenceException e)
            {
                result = new PostTranslationResponse {Error = true, Text = e.Message};
            }
            return JsonConvert.SerializeObject(result);
        }
    }
}