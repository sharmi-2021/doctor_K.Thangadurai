"""
Simple HTTP server that serves .html files without needing the extension.
e.g. /about → serves about.html
"""
import http.server
import os

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class HtmlExtensionHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Strip query string
        path = self.path.split('?')[0].split('#')[0]

        # If path has no extension and doesn't end with /, try adding .html
        _, ext = os.path.splitext(path)
        if not ext and not path.endswith('/'):
            html_path = os.path.join(DIRECTORY, path.lstrip('/') + '.html')
            if os.path.isfile(html_path):
                self.path = path + '.html'

        return super().do_GET()

    def log_message(self, format, *args):
        print(f"  {self.address_string()} - {format % args}")

if __name__ == '__main__':
    with http.server.HTTPServer(('', PORT), HtmlExtensionHandler) as httpd:
        print(f"\n  >> Server running at http://localhost:{PORT}")
        print(f"  >> Open: http://localhost:{PORT}/index.html")
        print(f"  >> Or:   http://localhost:{PORT}/about")
        print(f"\n  Press Ctrl+C to stop.\n")
        httpd.serve_forever()
