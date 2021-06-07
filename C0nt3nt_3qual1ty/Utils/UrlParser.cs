using C0nt3nt_3qual1ty.Models;

namespace C0nt3nt_3qual1ty.Utils
{
    public class UrlParser
    {
        private readonly ApisRequestsHandler _requestsHandler = new();
        private readonly Extractor _extractor = new();
        private readonly Translator _translator = new();
        private readonly EqualityChecker _checker = new();

        public void SetUrl(string rawUrl)
        {
            _extractor.SetUrlToExtract(rawUrl, _requestsHandler);
        }

        public string GetFullUrl()
        {
            string fullUrl = _extractor.GetUrl();
            return fullUrl;
        }

        public string GetTranslatorLimit()
        {
            return _translator.GetLimit(_requestsHandler);
        }

        public string GetPageTranslation(string html)
        {
            return _translator.GetFileTranslation(html, _requestsHandler);
        }

        public ParsedPage ParseUrl()
        {
            //Following line is not needed because db checking has already set the url
            //_extractor.SetUrlToExtract(url, _requestsHandler);
            string text = _extractor.GetText();
            string translatedText = _translator.GetTranslation(text, _requestsHandler);
            int equality = _checker.GetEquality(translatedText, _requestsHandler);
            ParsedPage page = new ParsedPage()
            {
                Html = _extractor.GetHtml(),
                Text = translatedText,
                Url = _extractor.GetUrl(),
                Translated = false,
                Uniqueness = 100 - equality
            };
            return page;
        }
    }
}