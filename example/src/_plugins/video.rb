class VideoTag < Liquid::Tag
  def initialize(tag_name, video, alt)
    super
    @filename = video
  end

  def render(context)
    page_name = context.registers[:page]["name"].split(".")[0]

    return <<~TEMPLATE
    <video playsinline muted="muted" autoplay="autoplay" preload="auto" loop="loop">
    <source
        src="#{ENV["SITE_URL"]}/files/#{page_name}/#{@filename}"
        type="video/mp4" />
    </video>
    TEMPLATE
  end
end

Liquid::Template.register_tag("video", VideoTag)
