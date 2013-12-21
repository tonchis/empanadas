use Rack::Static, urls: %w[/js /css /img], root: "./public"

map "/" do
  run ->(env) do
    [200, {"Content-Type" => "text/html"}, File.read("./views/index.html").lines]
  end
end

