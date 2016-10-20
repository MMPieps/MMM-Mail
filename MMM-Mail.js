Module.register("MMM-Mail",{
	defaults:{
		host: '',
		port: '',
		user: '',
		pass: '',
		subjectlength: 50,
	},
	messages: [],	//The storage for the Mails
	
	start: function(){
		console.log("Email module started!");
        this.sendSocketNotification('LISTEN_EMAIL',this.config);
        this.loaded = false;
	},
	
	socketNotificationReceived: function(notification, payload){
		if(payload.user==this.config.user)
		{
			if (notification === 'EMAIL_FETCH'){
				if(payload.messages){
					
					this.messages.length = 0; 	//clear Message storage
					console.log("Email-Fetch Event");
					
					this.messages = payload.messages;
					
					if(this.messages.length>0)
					{
						console.log(this.messages[0].id);
						this.messages.sort(function(a,b) {return b.id - a.id; });
					}
					this.updateDom(2000);
				}
			}
			if(notification === 'EMAIL_NEWMAIL')
			{
				var sender;
				if(payload.sender.name.length>0)
				{
					sender = payload.sender.name;
				}
				else
				{
					sender = payload.sender.address;
				}
				this.sendNotification("SHOW_ALERT",{
					type: "notification",
					title: "New Email on "+payload.user,
					message: "from "+sender
				});
			}
			if(notification === 'EMAIL_ERROR')
			{
				console.log("Email module restarted!");
				this.sendSocketNotification('LISTEN_EMAIL',this.config);
			}
		}
    },
	
	// Define required scripts.
    getStyles: function() {
        return ["email.css", "font-awesome.css"];
    },
	
	
	getDom: function(){
        var wrapper = document.createElement("table");
        wrapper.className = "small";
        var that =this;
		if(this.messages.length > 0)
        {
            var count = 0;
            this.messages.slice(0,this.config.numberOfEmails).forEach(function (mailObj) {

                var name = mailObj.sender[0].name.replace(/['"]+/g,"");
                var subject = mailObj.subject.replace(/[\['"\]]+/g,"");

                var emailWrapper = document.createElement("tr");
                emailWrapper.className = "normal";

                var nameWrapper = document.createElement("tr");
                nameWrapper.className = "bright";
				if(name.length)
				{
					nameWrapper.innerHTML = name;
				}
				else
				{
					nameWrapper.innerHTML = mailObj.sender[0].address;
				}
                emailWrapper.appendChild(nameWrapper);

                var subjectWrapper = document.createElement("tr");
                subjectWrapper.className = "light";
				//cut the subject
				if(subject.length > that.config.subjectlength)
				{
					subject = subject.substring(0,that.config.subjectlength);
				}
                subjectWrapper.innerHTML = subject;
                emailWrapper.appendChild(subjectWrapper);

                wrapper.appendChild(emailWrapper);

                // Create fade effect.
                if (that.config.fade) {
                    var startingPoint = that.messages.slice(0,that.config.numberOfEmails).length * 0.25;
                    var steps = that.messages.slice(0,that.config.numberOfEmails).length - startingPoint;
                    if (count >= startingPoint) {
                        var currentStep = count - startingPoint;
                        emailWrapper.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }
                count++;
            });
        }
        else{
            wrapper.innerHTML = "No Unread mails";
            wrapper.className = "small dimmed";
            return wrapper;
        }

        return wrapper;
    }
});