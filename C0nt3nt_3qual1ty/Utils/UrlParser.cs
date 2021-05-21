using System;

namespace C0nt3nt_3qual1ty.Utils
{
    public class UrlParser
    {
        private readonly ApisRequestsHandler _requestsHandler = new();
        private readonly Extractor _extractor = new();
        private readonly Translator _translator = new();
        private readonly EqualityChecker _checker = new();

        public string ParseUrl(string url)  //Maybe Urls in the method's title
        {
            //possible cycle
            string equality;
            try
            {
                _extractor.SetUrlToExtract(url, _requestsHandler);
                string text = _extractor.GetText();
                string translatedText = _translator.GetTranslation(text, _requestsHandler);
                equality = _checker.GetEquality(translatedText, _requestsHandler);
            }
            catch (NullReferenceException e)
            {
                equality = e.Message;
            }
            
            return equality;
        }
    }
}