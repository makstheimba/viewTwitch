function TwitchFollowing() {    
    this.following = [];
}
TwitchFollowing.prototype.addChannel = function(channel) {
    if (this.following.indexOf(channel) === -1) {
        this.following.push(channel);
    }
    return this;
}
TwitchFollowing.prototype.removeChannel = function(channel) {
    var i = this.following.indexOf(channel);
    if (i > -1) {
        this.following.splice(i, 1);
        $("#" + channel._id).remove();
    }
    return this;
}
TwitchFollowing.prototype.display = function () {
    var defaultLogo = "http://i67.tinypic.com/2qcnsxi.png",
        offline = "offline",
        self = this;
    
    this.following.forEach(function (channel) {
        
        if (channel.displayed) {
            return ;
        }
        $("section").append(
            $("<div/>")
            .addClass("following")
            .addClass(channel.game ? "online" : "offline")
            .attr("id", channel._id)
            .append($("<span class = 'name' />")
                    .append(channel.display_name)
                    .attr("title", channel.display_name)
                    )
            .append($("<span class = 'close' />")
                    .append("x")
                    .on("click", function () {
                        self.removeChannel(channel)  //remove channel                
                    })
                   )
            .append($("<img class = 'avatar'>")
                    .attr("src", channel.logo || defaultLogo)
                    .on("click", function () {
                        window.open(channel.url);
                    })
                   )
            .append($("<span class = 'game' />")
                    .append(channel.game || offline)
                    .attr("title", channel.game)
                    )
            
        )
        channel.displayed = true; //Set flag for already displayed channels
    });
}

$(document).ready(function () {
    var $search = $("#searchString"),
        twitch = new TwitchFollowing();
    
    function searchStreamers(name) {
        var query = "q=" + name,
            queryUrl = "https://api.twitch.tv/kraken/search/channels?" + query;
        
        $(".channel").remove();
        $(".wait").show();
        
        $.ajax({
            type: 'GET',
            url: queryUrl,
            headers: {
                Accept: 'application/vnd.twitchtv.v3+json',
                'Client-ID': '4k9sfomxudi9teq4vmkb7d17rbrwg5y'
            },
            success: function(data) {
                displaySearch(data.channels);
            }
        });
    }
    function displaySearch(channels) {
        var $res = $("#searchResult");
        
        $(".wait").hide();
        
        channels.forEach(function (channel) {        
            $res.append(
                $('<div/>')
                .addClass("channel")
                .append(channel.display_name)
                .append(
                    $("<button/>")
                    .addClass("buttAdd")
                    .html("+")
                )
            );
            $(".buttAdd").last().on("click", function () {
                twitch.addChannel(channel);
                twitch.display();
                console.log(twitch);
            });
        });
    }
    
    $("header").on("click", function () {
        window.open("https://www.twitch.tv/", "_blank");
    });
    $("#buttSearch").on("click", function () {
       searchStreamers($search.val()); 
    });
    $('body').on("keyup", function (event) {
        var key = event.which;
        if (key === 13) {
            searchStreamers($search.val());
        } else {
            $search.focus();
        }
    });
});