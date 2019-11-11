function open_widget(a, e) {
    e.preventDefault();
    var link = a.href;
    window.open(link, 'Changelly', 'width=600,height=470,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=0,left=0,top=0');
    return false;
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

﻿function Model() {
    var self = this;
    self.withdrawModal = (function (parent) {
        var self = {};

        var states = self.states = {
            notSubmited: 0,
            submited: 1,
            inProgress: 2,
            done: 3,
            failed: 4
        };

        self.state = ko.observable(data.withdrawalState);
        self.icoFinished = ko.observable(data.icoFinished);
        self.address = ko.observable();
        self.amount = data.earnedTokens;
        self.tokenName = data.tokenName;
        self.withdrawalText = ko.computed(function () {
            if (self.state() == states.notSubmited || self.state() == states.failed)
                return "Withdraw";
            else if (self.state() < states.done)
                return "Withdrawing...";
            else if (self.state() == states.done)
                return "Withdrew";
        });
        self.visible = ko.observable(false);
        self.withdrawing = ko.computed(function () {
            return self.state() > states.notSubmited && self.state() <= states.done;
        });
        self.show = function () {
            if (!self.icoFinished())
                return;

            if (self.state() == states.notSubmited) {
                self.visible(true);
                return;
            }

            self.UpdateWithdrawalInfo()
                .done(function () {
                    self.visible(true);
                });
        }

        self.UpdateWithdrawalInfo = function () {
            return $.getJSON('/Dashboard/GetWithdrawalInfo').done(function (data) {
                self.state(data.state);
                self.address(data.address);
            });
        };

        self.inProgress = ko.observable(false);
        self.submit = function (form) {
            if (!$(form).valid())
                return;

            self.inProgress(true);
            $.post('/Dashboard/SubmitWithdrawal', { address: self.address() }).done(function () {
                self.state(states.submited);
            }).always(function () {
                self.inProgress(false);
            });
        }
        return self;
    })(self);
}

var model = new Model();
ko.applyBindings(model);


