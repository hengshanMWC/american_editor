const app = getApp()

Page({
  data: {
    html: '<p class="xing-p">不谈琐碎的细节，突出主题，颜色运用。这些都是行为，这些行为是纹身师的能力表达，而他们要达到一个目标：</p><image class="xing-img" style="width: 100%" src="https://www.uooyoo.com/img2017/2/15/2017021560909533.jpg" _height="0.61983" _uploaded="true"></image><p class="xing-p">创作出来的这个纹身，有没有在瞬间抓住人眼球，让人不断的想一直看。</p>',
    xingText: '',
    title: '',
  },

  onInput(e){
    this.setData({
      title: e.detail
    })
  },

  finish: function (e) {
    console.log(e.detail.content) 
  },

})
