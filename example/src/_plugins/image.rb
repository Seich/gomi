class ImageTag < Liquid::Tag
  def initialize(tag_name, params, alt)
    super
    params = params.split(" ", 2)
    @filename = params[0]
    @alt = params[1].sub('"', "")
  end

  def render(context)
    page_name = context.registers[:page]["name"].split(".")[0]
    "![#{@alt}](#{ENV["SITE_URL"]}/files/#{page_name}/#{@filename})"
  end
end

Liquid::Template.register_tag("image", ImageTag)
