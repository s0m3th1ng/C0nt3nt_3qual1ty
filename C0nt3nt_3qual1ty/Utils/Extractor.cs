using System;
using Newtonsoft.Json.Linq;

namespace C0nt3nt_3qual1ty.Utils
{
    public class Extractor
    {
        private const string NoResultError = "Result was not extracted yet.";
        private const string HttpRequestError = "Error connecting the extraction server";
        private readonly string _apiKey = Config.Get("ApiKeys:ExtractionKey");
        private string _result;

        public void SetUrlToExtract(string extractUrl, ApisRequestsHandler requestsHandler)
        {
            string requestUrl = $"https://extractorapi.com/api/v1/extractor?apikey={_apiKey}&url={extractUrl}&fields=clean_html";
            string requestResult = requestsHandler.GetRequestResponse(requestUrl).Result;
            _result = requestResult;
            if (_result == null)
            {
                throw new NullReferenceException(HttpRequestError);
            }
        }

        public string GetText()
        {
            int cutLength = int.Parse(Config.Get("ContentCutLength"));
            if (_result == null)
            {
                throw new NullReferenceException(NoResultError);
            }

            string text = (string) JObject.Parse(_result)["text"];
            return text.Length > cutLength ? text.Substring(0, cutLength) : text;
        }

        public string GetHtml()
        {
            if (_result == null)
            {
                throw new NullReferenceException(NoResultError);
            }

            string html = (string) JObject.Parse(_result)["clean_html"];
            return html;
        }

        public string GetUrl()
        {
            if (_result == null)
            {
                throw new NullReferenceException(NoResultError);
            }

            string url = (string) JObject.Parse(_result)["url"];
            return url;
        }
    }
}