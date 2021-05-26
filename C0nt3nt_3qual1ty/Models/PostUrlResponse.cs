namespace C0nt3nt_3qual1ty.Models
{
    public class PostUrlResponse
    {
        public string Url { get; set; }
        public bool Error { get; set; }
        public string ErrorMessage { get; set; }
        public ParsedPage Page { get; set; }

        public PostUrlResponse(string url, ParsedPage page)
        {
            Url = url;
            Page = page;
            Error = false;
            ErrorMessage = null;
        }

        public PostUrlResponse(string url, string errorMessage)
        {
            Url = url;
            Page = null;
            Error = true;
            ErrorMessage = errorMessage;
        }
    }
}