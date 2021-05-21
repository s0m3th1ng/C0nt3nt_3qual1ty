using C0nt3nt_3qual1ty.Models;

namespace C0nt3nt_3qual1ty.Utils
{
    public class UrlParser
    {
        private readonly ApisRequestsHandler _requestsHandler = new();
        private readonly Extractor _extractor = new();
        private readonly Translator _translator = new();
        private readonly EqualityChecker _checker = new();

        public ParsedPage ParseUrl(string url)  //Maybe Urls in the method's title
        {
            //possible cycle
            _extractor.SetUrlToExtract(url, _requestsHandler);
            string text = _extractor.GetText();
            string translatedText = _translator.GetTranslation(text, _requestsHandler);
            int equality = _checker.GetEquality(translatedText, _requestsHandler);
            ParsedPage page = new ParsedPage()
            {
                Html = _extractor.GetHtml(),
                Text = text,
                Url = url,
                Equality = equality
            };
            return page;
        }
    }
}