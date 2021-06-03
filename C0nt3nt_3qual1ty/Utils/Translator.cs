using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json.Linq;

namespace C0nt3nt_3qual1ty.Utils
{
    public class Translator
    {
        private const string HttpRequestError = "Error connecting the translation server";
        private const string TranslationError = "Error while translating document";
        private readonly string _apiKey = Config.Get("ApiKeys:TranslationKey");
        private readonly string _lang = Config.Get("TranslationLang");

        public string GetLimit(ApisRequestsHandler requestsHandler)
        {
            string requestUrl = $"https://api.deepl.com/v2/usage?auth_key={_apiKey}";
            string requestResult = requestsHandler.GetRequestResponse(requestUrl).Result;
            if (requestResult == null)
            {
                return $"Translation limit not available. {HttpRequestError}";
            }
            string balance = $"Translation limit: {(string) JObject.Parse(requestResult)["character_count"]}/{(string) JObject.Parse(requestResult)["character_limit"]}";
            return balance;
        }

        public string GetTranslation(string text, ApisRequestsHandler requestsHandler)
        {
            string requestUrl = $"https://api.deepl.com/v2/translate?auth_key={_apiKey}&text={text}&target_lang={_lang}";
            string requestResult = requestsHandler.GetRequestResponse(requestUrl).Result;
            if (requestResult == null)
            {
                throw new NullReferenceException(HttpRequestError);
            }
            string translation = (string) JObject.Parse(requestResult)["translations"][0]["text"];
            return translation;
        }

        public string GetFileTranslation(string html, ApisRequestsHandler requestsHandler)
        {
            string requestUrl = "https://api.deepl.com/v2/document";
            var content = CreateFileContent(html);
            string requestResult = requestsHandler.PostFileRequestResponse(requestUrl, content).Result;
            if (requestResult == null)
            {
                throw new NullReferenceException(HttpRequestError);
            }

            string documentId = (string) JObject.Parse(requestResult)["document_id"];
            string documentKey = (string) JObject.Parse(requestResult)["document_key"];
            while (!DocumentTranslated(documentId, documentKey, requestsHandler))
            { }
            
            string translation = GetTranslatedHtml(documentId, documentKey, requestsHandler);
            return translation;
        }

        private MultipartFormDataContent CreateFileContent(string html)
        {
            byte[] data = Encoding.UTF8.GetBytes(html);
            var content = new MultipartFormDataContent("boundary");
            var htmlContent = new ByteArrayContent(data);
            htmlContent.Headers.Add("Content-Disposition", "form-data; name=\"file\"; filename=\"fileName.html\"");
            var authContent = new StringContent(_apiKey);
            authContent.Headers.Add("Content-Disposition", "form-data; name=\"auth_key\"");
            var langContent = new StringContent(_lang);
            langContent.Headers.Add("Content-Disposition", "form-data; name=\"target_lang\"");
            
            content.Add(htmlContent, "file");
            content.Add(authContent, "auth_key");
            content.Add(langContent, "target_lang");

            return content;
        }

        private bool DocumentTranslated(string id, string key, ApisRequestsHandler requestsHandler)
        {
            string requestUrl = $"https://api.deepl.com/v2/document/{id}?auth_key={_apiKey}&document_key={key}";
            string requestResult = requestsHandler.GetRequestResponse(requestUrl).Result;
            if (requestResult == null)
            {
                return false;
            }
            string status = (string) JObject.Parse(requestResult)["status"];
            if (Equals(status, "error"))
            {
                throw new NullReferenceException(TranslationError);
            }
            if (Equals(status, "done"))
            {
                return true;
            }
            return false;
        }

        private string GetTranslatedHtml(string id, string key, ApisRequestsHandler requestsHandler)
        {
            string requestUrl = $"https://api.deepl.com/v2/document/{id}/result?auth_key={_apiKey}&document_key={key}";
            string requestResult = requestsHandler.GetRequestResponse(requestUrl).Result;
            if (requestResult == null)
            {
                throw new NullReferenceException(HttpRequestError);
            }
            return requestResult;
        }
    }
}