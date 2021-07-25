<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">
      <!-- 属性：topImages 传入值：top-images -->
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-params-info ref="params" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :commentInfo="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>
    <detail-bottom-bar @addCart="addToCart"/>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
    <!-- <toast :message="message" :show="show"/> -->
  </div>
</template>

<script>
  import DetailNavBar from './childComps/DetailNavBar'
  import DetailSwiper from './childComps/DetailSwiper'
  import DetailBaseInfo from './childComps/DetailBaseInfo'
  import DetailShopInfo from './childComps/DetailShopInfo'
  import DetailGoodsInfo from './childComps/DetailGoodsInfo'
  import DetailParamsInfo from './childComps/DetailParamInfo'
  import DetailCommentInfo from './childComps/DetailCommentInfo'
  import DetailBottomBar from './childComps/DetailBottomBar'

  import Scroll from 'components/common/scroll/Scroll'
  import GoodsList from 'components/content/goods/GoodsList'
  // import Toast from 'components/common/toast/Toast'

  import {getDetail,Goods,Shop,GoodsParam,getRecommend} from "network/detail"
  import {debounce} from "common/utils"
  import {itemListenerMixin,backTopMixin} from "common/mixin"

  // import {mapActions} from 'vuex'

  export default{
    name:"Detail",
    components:{
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamsInfo,
      DetailCommentInfo,
      GoodsList,
      // Toast,
      DetailBottomBar,
      Scroll
    },
    mixins:[itemListenerMixin,backTopMixin],
    data(){
      return {
        iid:null,
        topImages:[],
        goods:{},
        shop:{},
        detailInfo:{},
        paramInfo:{},
        commentInfo:{},
        recommends:[],
        themeTopYs:[],
        getThemeTopY:null,
        currentIndex:0,
        // message:'',
        // show:false
      }
    },
    created(){
      //1.保存传入的iid
      this.iid = this.$route.params.iid

      //2.根据iid请求详情数据
      getDetail(this.iid).then(res => {
        // console.log(res);
        //2.1 获取顶部的图片轮播数据
        const data = res.result;
        this.topImages = data.itemInfo.topImages

        //2.2 获取商品信息
        this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)

        //2.3 创建店铺信息
        this.shop = new Shop(data.shopInfo)

        //2.4 获取商品的详细信息
        this.detailInfo = data.detailInfo

        //2.5 获取参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule)

        //2.6 获取评论信息
        if(data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0]
        }

        // //1.第一次获取，值不对
        // //值不对的原因：this.$refs.params.$el压根没有渲染
        // this.themeTopYs = [];
        // this.themeTopYs.push(0);
        // //拿组件要加$el
        // this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        // this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        // this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);

        // this.$nextTick(() => {
        //   //2.第二次获取：值不对
        //   //值不对的原因：图片没有计算在内
        //   //根据最新的数据，对应的DOM是已经被渲染出来
        //   //但是图片依然是没有加载完(目前的offsetTop不包含其中的图片)
        //   //offsetTop值不对的时候，都是因为图片的问题
        //   this.themeTopYs = [];
        //   this.themeTopYs.push(0);
        //   //拿组件要加$el
        //   this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        //   this.themeTopYs.push(Number.MAX_VALUE);
        //   console.log(this.themeTopYs);
        // })
      })
      // 3. 获取推荐商品
      getRecommend().then(res => {
        // console.log(res);
        this.recommends = res.data.list;
      })

      //4.给getThemeTopY赋值(对给this.themeTopYs赋值的操作进行防抖)
      this.getThemeTopY = debounce(() => {
        this.themeTopYs = [];
        this.themeTopYs.push(0);
        //拿组件要加$el
        this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        this.themeTopYs.push(Number.MAX_VALUE);
      },100)
    },
    mounted(){
    },
    updated() {
      // this.themeTopYs = [];
      // this.themeTopYs.push(0);
      // //拿组件要加$el
      // this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      // this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      // this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      // this.themeTopYs.push(Number.MAX_VALUE);
    },
    destroyed() {
      this.$bus.$off('itemImgLoad',this.itemImgListener)
    },
    methods:{
      // ...mapActions(['addCart']),
      imageLoad(){
        this.refresh();
        this.getThemeTopY()
      },
      titleClick(index){
        // console.log(index);
        this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],100)
      },
      contentScroll(position) {
        //1.获取y值
        const positionY = -position.y

        //2.positionY和主题中值进行对比
        //[0,a,b,c]
        //positionY在0到a之间，index=0
        //positionY在a到b之间，index=1
        //positionY在b到c之间，index=2
        //positionY超过c，index=3
        let length = this.themeTopYs.length
        for(let i=0;i<length-1;i++){
        //   if(positionY > this.themeTopYs[parseInt(i)] && positionY < this.themeTopYs[i+1]){
        // }

          if(this.currentIndex !== i && (positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1])){
            this.currentIndex = i;
            this.$refs.nav.currentIndex = this.currentIndex
          }

        //条件一：防止赋值的过程过于频繁
        //条件二中的条件1：判断在两个数字之间的区间；条件二中的条件2：判断大于等于某个数字
          // if(this.currentIndex !== i && (i < length-1 && positionY >= this.themeTopYs[i] && positionY <
          // this.themeTopYs[i+1]) || (i === length-1 && positionY >= this.themeTopYs[i])){
          //     this.currentIndex = i;
          //     this.$refs.nav.currentIndex = this.currentIndex
          // }

        //3.是否显示回到顶部
        this.listenShowBackTop(position)
        }
      },
      addToCart(){
        //1.获取购物车需要展示的信息
        const product = {}
        product.image = this.topImages[0];
        product.title = this.goods.title;
        product.desc = this.goods.desc;
        product.price = this.goods.realPrice;
        product.iid = this.iid

        //2.将商品添加到购物车里(1.Promise 2.mapActions)
        // this.$store.cartList.push(product)
        // this.$store.commit('addCart',product)
        // this.addCart(product).then(res => {
        //   console.log(res);
        // })

        this.$store.dispatch('addCart',product).then(res => {
          // this.show = true;
          // this.message = res;
          // setTimeout(() => {
          //   this.show = false;
          //   this.message = ''
          // },1500)

          this.$toast.show(res,2000)
          // console.log(this.$toast)
        })
      }
    }
  }
</script>

<style scoped>
  #detail{
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav{
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .content{
    height: calc(100% - 44px);
    overflow: hidden;
  }
</style>
