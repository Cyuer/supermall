<template>
  <div class="cart">
    <!-- 导航 -->
    <nav-bar class="nav-bar">
      <div slot="center">购物车({{length}})</div>
    </nav-bar>

    <!-- 商品列表 -->
    <scroll class="content" ref="scroll">
      <cart-list/>
    </scroll>

    <!-- 底部汇总 -->
    <cart-bottom-bar></cart-bottom-bar>
  </div>
</template>

<script>
  import NavBar from 'components/common/navbar/NavBar'
  import CartList from './childComps/CartList'
  import CartBottomBar from './childComps/CartBottomBar'

  import Scroll from 'components/common/scroll/Scroll'

  import {mapGetters} from 'vuex'

  export default{
    name:'Cart',
    components:{
      NavBar,
      CartList,
      CartBottomBar,
      Scroll
    },
    computed:{
      // cartLength(){
      //   return this.$store.getters.cartLength
      // }

      //两种语法
      // ...mapGetters(['cartLength','cartList'])
      ...mapGetters({
        length:'cartLength'
      })
    },
    activated() {
      this.$refs.scroll.refresh()
    }
  }
</script>

<style scoped>
  .cart{
    height: 100vh;
  }

  .nav-bar{
    background-color: var(--color-tint);
    color: #FFFFFF;
    /* font-weight: 700; */
  }

  .content{
    height: calc(100% - 49px - 44px - 40px);
    overflow: hidden;
  }
</style>
