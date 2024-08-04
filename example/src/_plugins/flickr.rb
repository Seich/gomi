require "jekyll"
require "base64"
require "json"
require "net/http"
require "date"

module Jekyll
  class Flickr < Liquid::Block
    include Liquid::StandardFilters

    def initialize(tag, params, context)
      @cache ||= Jekyll::Cache.new("Jekyll::Flickr")
      @amount = params.to_i
      super
    end

    def render(context)
      api_key = ENV["FLICKR_KEY"]
      user_id = ENV["FLICKR_USER"]
      url = URI.parse "https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=#{api_key}&user_id=#{user_id}&per_page=#{@amount}&format=json&nojsoncallback=1&sort=date-taken-desc&extras=url_z"

      @cache.getset(Time.now.min) do
        data = JSON.parse(Net::HTTP.get(url))
        photos = data["photos"]["photo"]
        photos.map! do |photo|
          {
            image: "data:image/jpg;base64," << Base64.encode64(Net::HTTP.get(URI.parse photo["url_z"])),
            url: "https://www.flickr.com/photos/#{photo["owner"]}/#{photo["id"]}",
            alt: photo["title"]
          }
        end

        result = []
        context.stack do
          photos.each do |photo|
            context["image"] = photo[:image]
            context["url"] = photo[:url]
            context["alt"] = photo[:alt]

            result << @body.render(context)
          end
        end

        result
      end

    end
  end
end

Liquid::Template.register_tag("flickr", Jekyll::Flickr)
