since_id = '';

function get_twitter(pages)
{
	for (p=pages; p>=1; p--)
	{
		if (pages > 1)
			since = '';
		else
			since = '&'+since_id;
		
		$('#info').html('Searching for new Tweets');
				
		var url = "http://search.twitter.com/search.json?rpp=100&show_user=true&geocode="+latitude+"%2C"+longitude+"%2C"+radius+units+"&page="+p+"&callback=?"+since;
		
		new_tweets = 0;
		updated_tweets = 0;
		
		$.ajax({
        url: url,
        data: {
        },
        dataType: "jsonp",
        jsonp: "jsoncallback",
        timeout: 5000,
        success: function(data, status){
			since_id = data.refresh_url.replace('?', '').replace('&q=', '');
			setTimeout ( "$('#info').html('');", 5000 );
			
            $.each(data.results, function(i,result){
                var loc = checkLocation(result.location);
				var age = new Date().getTime() - Date.parse(result.created_at);
					
				if (loc != null && age <= maxtweetage)
				{
					loc = loc.split(',');
					
					twitlat = loc[0];
					twitlong = loc[1];
					
					
					
					
					
					/*
					if ($('#tweet_'+result.from_user).length != 1)
					{
						tw = new Tweet(result.from_user, world, result.profile_image_url, result.text, result.created_at, twitlat, twitlong);
						world.addTweet(tw);
						new_tweets ++;
					}
					else
					{
						var update_tweet = world.getTweet(result.from_user);
						var last_tweet_time = Date.parse(update_tweet.contenttime);
						var tweet_time = Date.parse(result.created_at);
						if (tweet_time > last_tweet_time)
						{
							update_tweet.setContent(result.text, result.created_at);
							updated_tweets ++;
						}
					}
					*/
					
					$('#info').html('Found ' + new_tweets + ' new Tweets and ' + updated_tweets + ' updates');
				}
            });
        },
        error: function(XHR, textStatus, errorThrown){
            console.debug("ERROR: " + textStatus);
            console.debug("ERROR: " + errorThrown);
        }
		});
	}
}

function checkLocation(loc)
{
	if (loc.indexOf('iPhone: ') != -1)
		loc = loc.replace('iPhone: ', '');
		
	if (loc.indexOf(',') != -1)
	{
		splitloc = loc.split(',');
		
		if (Number(splitloc[1]))
		{
			return loc;
		}
		else
		{
			return null;
		}
	}
	else
	{
		return null;
	}
}

function set_geolocation(newlat, newlong)
{
	latitude = newlat;
	longitude = newlong;
	
	if (firstpos == false)
	{
		get_twitter(3);
		setInterval ( "get_twitter(1);", updateinterval );
		firstpos = true;
		$('#dim').fadeOut(100);
	}
	
	world.setCenter(latitude, longitude);
}

function set_angle(angle)
{
	world.setAngle(angle);
}

function set_accelerometer(x, y, z)
{
	var a = Math.atan(x/y);
	
	if (a >= 0.4 || a <= -0.4 || y >= 0.8)
	{
		$('#dim').fadeIn(100);
		$('#dim').css('webkit-transform', 'rotate('+a+'rad)');
	}
	else
	{
		if ($('#dim').css('opacity') != 0)
			$('#dim').fadeOut(100);
	}

	$('#tweets').css('top', z*400);
}

function set_radius(val)
{
	radius = val;
}

function set_units(val)
{
	units = val;
}