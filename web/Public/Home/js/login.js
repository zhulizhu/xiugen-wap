/**
 * Created by NicoleQi on 2016/11/25.
 */
$(document).ready(function () {
        $('.section1').find('.login-left-form').animate({"left": '0'});
        $('.section1').find('.login-right-form').animate({"right": '0'});
        $('.main-wrapper').fullpage({
            verticalCentered: false,//内容垂直居中
            anchors: ['page1', 'page2', 'page3'],
            loopBottom: true,
            'onLeave': function (index) {
                if (index == 1) {
                    $('.section1').find('.login-left-form').animate({"left": '-50%'});
                    $('.section1').find('.login-right-form').animate({"right": '-50%'});
                }
                if (index != 2) {
                    $('.section2').find('.download-left').animate({"marginTop": "-100%"});
                    $('.section2').find('.phone-img1').animate({"marginLeft": "-145px", "left": "50%"});
                    $('.section2').find('.phone-img2').animate({"marginRight": "-145px", "right": "50%"});
                }
                if (index != 3) {
                    $('.section3').find('.download-btn').fadeOut();
                    $('.section3').find('.show-pic2').animate({"left": "0", "top": "0"});
                    $('.section3').find('.show-pic3').animate({"left": "0", "top": "0"});
                }
            },
            'afterLoad': function (anchorLink, index) {
                if (index == 1) {
                    $('.section1').find('.login-left-form').animate({"left": '0'});
                    $('.section1').find('.login-right-form').animate({"right": '0'});
                }
                if (index == 1) {
                    $('.section1').find('.login-left-form').delay(100).addClass('move');
                }
                if (index == 2) {
                    $('.section2').find('.download-left').animate({"marginTop": 0});
                    $('.section2').find('.phone-img1').animate({"marginLeft": 0, "left": 0}, 500);
                    $('.section2').find('.phone-img2').delay(200).animate({"marginRight": 0, "right": 0}, 1000);
                }
                if (index == 3) {
                    $('.section3').find('.download-btn').fadeIn(800);
                    $('.section3').find('.show-pic2').animate({"left": "100px", "top": "100px"}, 500);
                    $('.section3').find('.show-pic3').animate({"left": "190px", "top": "230px"}, 1000);
                }
            }
        });

});
