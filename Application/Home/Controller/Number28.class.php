<?php
/**
 * Created by PhpStorm.
 * User: 34772
 * Date: 2017/4/26
 * Time: 10:46
 */
namespace Home\Controller;
class Number28
{
    public static function recombine($number,$id,$api){
        if($id >= 250 && $id<= 277){
            return self::check($number,$api,1);
        }elseif($id == 280 || $id == 281 || $id == 282 || $id == 283){
            return self::check($number,$api,2);
        }elseif($id == 284 || $id == 285 || $id == 286 || $id == 287){
            return self::check($number,$api,3);
        }elseif($id == 288 || $id == 289){
            return self::check($number,$api,4);
        }elseif($id == 294){
            return self::check($number,$api,5);
        }elseif($id == 290 || $id == 291 || $id == 292){
            return self::check($number,$api,6);
        }elseif($id == 293){
            return self::Tmb3($number,$api);
        }
    }
    public static function check($number,$api,$n){
        if($number == '' || !self::check_num($number,$n)){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if($api == 1){
            return $number;
        }else{
            return true;
        }
    }
    public static function Tmb3($number,$api){
        $numbers = explode("|",$number);
        if(count($numbers) != 3){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            if(!self::check_num($v,1)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return $number;
        }else{
            return true;
        }
    }

    public static function check_num($num,$n){
        switch($n){
            case 1:
                if(!in_array($num,array('0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'))){
                    return false;
                }break;
            case 2:
                if(!in_array($num,array('大','小','单','双'))){
                    return false;
                }break;
            case 3:
                if(!in_array($num,array('大单','大双','小单','小双'))){
                    return false;
                }break;
            case 4:
                if(!in_array($num,array('极大','极小'))){
                    return false;
                }break;
            case 5:
                if(!in_array($num,array('豹子'))){
                    return false;
                }break;
            case 6:
                if(!in_array($num,array('红','绿','蓝'))){
                    return false;
                }break;
        }
        return true;
    }
}