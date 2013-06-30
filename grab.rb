require 'net/http'
require 'json'

urls = IO.read("urls.txt").split("\n").select { |x| x =~ /./ }

datas = []

https = Net::HTTP::new('gdata.youtube.com', 443)
https.use_ssl = true
https.verify_mode = OpenSSL::SSL::VERIFY_NONE

urls.each do |url|
  uri = URI.parse("https://gdata.youtube.com/feeds/api/videos/#{url}")
  uri.query = URI.encode_www_form({ v: '2', alt: 'json' })
  request = Net::HTTP::Get.new(uri.request_uri)
  resp = https.request(request)
  puts "#{url} - #{resp}"
  datas << JSON::parse(resp.body, :symbolize_names => true)
end

File.open("output.json", "w") { |f| JSON::dump(datas, f) }
