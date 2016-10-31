function TwitchFollowing() {    
    if (localStorage.getItem("twitch")) {
        this.following = JSON.parse(localStorage.getItem("twitch")).following;
        this.following.forEach(function (channel) {
            channel.displayed = false;
        });
    } else {
        this.following = [];
    }
}
TwitchFollowing.prototype.addChannel = function(channel) {
    var find_id = channel._id,
        search_id = $.grep(this.following, function(e) {return e._id === find_id}),
        i = this.following.indexOf(search_id[0]);
    if (i === -1) {
        this.following.push(channel);
    }
    return this;
}
TwitchFollowing.prototype.removeChannel = function(channel) {
    var find_id = channel._id,
        search_id = $.grep(this.following, function(e) {return e._id === find_id}),
        i = this.following.indexOf(search_id[0]);
    
    if (i > -1) {
        this.following[i].displayed = false;
        this.following.splice(i, 1);        
        $("#" + channel._id).remove();
    }
    return this;
}
TwitchFollowing.prototype.updateStatus = function(channel) {
    var name = channel.name,
        $channelGame = $("#" + channel._id + " .game"),
        $channel = $("#" + channel._id);
    
    $.ajax({
        type: "GET",
        url: "https://api.twitch.tv/kraken/streams/" + name,
        headers: {
            Accept: 'application/vnd.twitchtv.v3+json',
            'Client-ID': '4k9sfomxudi9teq4vmkb7d17rbrwg5y'
        },
        success: function(data) {            
            if (data.stream) {
                $channelGame.attr("title", data.stream.game).text(data.stream.game);
                $channel.removeClass("offline").addClass("online");
            } else {
                $channelGame.attr("title", "offline").text("offline");
                $channel.removeClass("online").addClass("offline")
            }
        },
        error: function () {
            alert("Server won't respond")
        }
    });
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
            .addClass("following offline")
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
            .append($("<span class = 'game' />"))
            
        )
        
        self.updateStatus(channel);
        channel.displayed = true; //Set flag for already displayed channels
    });
}

$(document).ready(function () {
    var $search = $("#searchString"),
        twitch = new TwitchFollowing();    
    
    twitch.display();
    
    function searchExpand() {
        $("aside").css("flex-basis", "100%");
        $("section").hide();
        $("#buttExpand").removeClass("rotated").addClass("rotated");        
    }
    
    function searchStreamers(name) {
        var query = "q=" + name,
            queryUrl = "https://api.twitch.tv/kraken/search/channels?" + query;
        
        $(".channel").remove();
        $(".wait").show();
        searchExpand();
        
        $.ajax({
            type: 'GET',
            url: queryUrl,
            headers: {
                Accept: 'application/vnd.twitchtv.v3+json',
                'Client-ID': '4k9sfomxudi9teq4vmkb7d17rbrwg5y'
            },
            success: function(data) {
                displaySearch(data.channels);
            },
            error: function () {
                alert("Server won't respond")
            }
        });
    }
    function displaySearch(channels) {
        /* Display streamers */
        
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
    $("body").on("keyup", function (event) {
        var key = event.which;
        if (key === 13) {
            searchStreamers($search.val());
        } else {
            $search.focus();
        }
    });
    $("#buttExpand").on("click", function () {
        var $aside = $("aside");
        
        $(this).toggleClass("rotated");
        if ($aside.css("flex-basis") === "100%") {
            $aside.css("flex-basis", "3.5rem");
            $("section").show();
        } else {
            $aside.css("flex-basis", "100%");
            $("section").hide();
        }
    });
    $(window).on("unload", function () {
       localStorage.setItem("twitch", JSON.stringify(twitch));
    });
});