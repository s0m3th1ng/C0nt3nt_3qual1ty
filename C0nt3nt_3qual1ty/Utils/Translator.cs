﻿using System;
using Newtonsoft.Json.Linq;

namespace C0nt3nt_3qual1ty.Utils
{
    public class Translator
    {
        private const string HttpRequestError = "Error connecting the translation server";
        private readonly string _apiKey = Config.Get("ApiKeys:TranslationKey");
        private readonly string _lang = Config.Get("TranslationLang");

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
    }
}