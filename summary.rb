require 'json'

raw_doc = JSON::parse(IO.read("output.json"), { :symbolize_names => true })

summary = raw_doc.collect do |e|
  title = e[:entry][:title][:$t]
  title =~ /The Voice UK 2013 \| (.*) - BBC One/
  title = $1

  title =~ /^(.*)- (.*$)/
  left = $1.chomp(" ")
  event = $2

  who = nil
  song = nil

  case left
  when /(.*) sings '(.*)'$/
    who = $1 ; song = $2
  when /(.*) Duet: '(.*)'$/
    who = $1 ; song = $2
  when /(.*) performs? '(.*)'$/
    who = $1 ; song = $2
  when /(.*) performs (.*)$/
    who = $1 ; song = $2
  when /(.*) Vs ([^:]*)(: Battle Performance)?/
    who = $1 + " Vs " + $2
    case $1
    when /Mike/
      song = "Landslide"
    when /Matt/
      song = "Do I Do"
    when /Andrea/
      song = "People Help The People"
    when /Leah/
      song = "The Way You Make Me Feel"
    end
  end

  key = nil
  case who
  when /Mike/
    key = :mike
  when /Matt/
    key = :matt
  when /Andrea/
    key = :andrea
  when /Leah/
    key = :leah
  when /Will/
    key = :leah
  when /Jessie/
    key = :matt
  when /Tom/
    key = :mike
  when /Danny/
    key = :andrea
  end

  event_key = nil
  case event
  when /The Live Final/
    if who =~ / and / then
      event_key = :final_mentor
    elsif ["Loving You", "Angel", "Don't Close Your Eyes"].member?(song)
      event_key = :final_repeat
    else
      event_key = :final
    end
  when /The Live Semi/
    if who =~ /Team/ then
      event_key = :semi_team
    else
      event_key = :semi
    end
  when /The Live Quarter/
    event_key = :quarter
  when /The Knockout/
    event_key = :knockout
  when /Battle Round/
    event_key = :battle
  when /Blind Auditions/
    event_key = :blind
  end

  { :key        => key,
    :event_key  => event_key,
    :who        => who,
    :song       => song,
    :event      => event,
    :published  => e[:entry][:published][:$t],
    :views      => e[:entry][:"yt$statistics"][:viewCount],
    :likes      => e[:entry][:"yt$rating"][:numLikes],
    :dislikes   => e[:entry][:"yt$rating"][:numDislikes],
    :link       => e[:entry][:link][0][:href]
  }
end

File.open("summary.json", "w") { |f| JSON::dump(summary, f) }
