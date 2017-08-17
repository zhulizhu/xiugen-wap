<?php
/**
 * Created by PhpStorm.
 * User: 34772
 * Date: 2017/4/25
 * Time: 15:11
 */
namespace Home\Controller;

class NumberPk10
{
    public static function recombine($number,$id,$selectNum,$weiShu,$api){
        if($id == 93 || $id == 437 || $id == 440 || $id == 443 || $id == 447 || $id == 451 || $id == 455 || $id == 459 || $id == 463 || $id == 467){
            return self::Dym($number,$selectNum,$api);
        }elseif($id == 436 || $id == 438 ||$id == 441 ||$id == 444 ||$id == 448 ||$id == 452 ||$id == 456 ||$id == 460 ||$id == 464 ||$id == 468){
            return self::CDyDs($number,$selectNum,$api);
        }elseif($id == 94 || $id == 95 || $id == 445 || $id == 449 || $id == 453 || $id == 457 || $id == 461 || $id == 465 || $id == 469){
            return self::Cq($number,$selectNum,$api);
        }elseif($id == 439 || $id == 442 || $id == 446 || $id == 450 || $id == 454 || $id == 458 || $id == 462 || $id == 466 || $id == 470){
            return self::CqDs($number,$selectNum,$api);
        }elseif($id == 96){
            return self::Dwd($number,$selectNum,$api);
        }elseif($id == 225 || $id == 226 || $id == 227){
            return self::Dxds($number,$selectNum,$api);
        }elseif($id == 246){
            return self::Hz($number,$selectNum,$api,3);
        }elseif($id == 247){
            return self::Hz($number,$selectNum,$api,4);
        }elseif($id == 300){
            return self::Hz($number,$selectNum,$api,5);
        }elseif($id == 237){
            return self::Lhd($number,$selectNum,$api);
        }
    }
    public static function Dym($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode(',',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            $numbers[$k] = Number11x5::add0($v);
            if(!self::check_num($numbers[$k],1)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }
    public static function CDyDs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$number);
        }else{
            $numbers = explode('$',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            $numbers[$k] = Number11x5::add0($v);
            if(!self::check_num($numbers[$k],1)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }
    public static function Cq($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$number);
            if(count($numbers) != $selectNum){
                return false;
            }
            foreach($numbers as $key=>$value){
                $num = explode(' ',$value);
                foreach($num as $k=>$v){
                    if(!self::check_num($v,1)){
                        return false;
                    }
                }
            }
            return true;
        }else{
            $numbers = explode('-',$number);
            if(count($numbers) != $selectNum){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            foreach($numbers as $key=>$value){
                $num = explode(',',$value);
                foreach($num as $k=>$v){
                    $num[$k] = Number11x5::add0($v);
                    if(!self::check_num($num[$k],1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$num);
            }
            return implode(',',$numbers);
        }
    }
    public static function CqDs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$number);
        }else{
            $numbers = explode('$',$number);
        }
        foreach($numbers as $key=>$value){
            $num = explode(',',$value);
            if(count($num) != $selectNum){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
            foreach($num as $k=>$v){
                $num[$k] = Number11x5::add0($v);
                if(!self::check_num($num[$k],1)){
                    return Number::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            if($api == 1){
                $numbers[$key] = implode(',',$num);
            }
        }
        if($api == 1){
            return implode('|',$numbers);
        }else{
            return true;
        }
    }
    public static function Dwd($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
            $n = 0;
            foreach($numbers as $k => $v){
                if($v != '-'){
                    $n++;
                    $num = explode(' ',$v);
                    foreach($num as $key => $value){
                        if(!self::check_num($value,1)){
                            return false;
                        }
                    }
                }
            }
            if($n < $selectNum){
                return false;
            }
            return true;
        }else{
            $numbers = explode('-',$numbers);
            $n = 0;
            foreach($numbers as $k => $v){
                if($v == ''){
                    $numbers[$k] = '-';
                }else{
                    $num = explode(',',$v);
                    foreach($num as $key => $value){
                        $num[$k] = Number11x5::add0($v);
                        if(!self::check_num($value,1)){
                            Number::show_false(0,'提交号码出错，请重新投注',1);
                        }
                    }
                    $n++;
                    $numbers[$k] = implode(' ',$num);
                }
            }
            if($n < $selectNum){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            $number = implode(',',$numbers);
            return $number;
        }
    }
    public static function Dxds($numbers,$selectNum,$api){
        if(strlen($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }else{
            $number = mb_str_split($numbers);
            foreach($number as $k=>$v){
                if(!self::check_num($v,2)){
                    return Number::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
        }
        if($api == 1){
            return $numbers;
        }else{
            return true;
        }
    }
    public static function Lhd($number,$selectNum,$api){
        $numbers = explode(',',$number);
        $n = 0;
        foreach($numbers as $key=>$value){
            if($value != "-"){
                $n++;
                if(!self::check_num($value,6)){
                    return Number::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
        }
        if($n < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if($api == 1){
            return $number;
        }else{
            return true;
        }
    }
    public static function Hz($number,$selectNum,$api,$n){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode(',',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            if(!self::check_num($v,$n)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }

    public static function check_num($num,$n){
        switch($n){
            case 1:
                if(!in_array($num,array('01','02','03','04','05','06','07','08','09','10'))){
                    return false;
                }break;
            case 2:
                if(!in_array($num,array('大','小','单','双'))){
                    return false;
                }break;
            case 3:
                if(!in_array($num,array('3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19'))){
                    return false;
                }break;
            case 4:
                if(!in_array($num,array('6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'))){
                    return false;
                }break;
            case 5:
                if(!in_array($num,array('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49'))){
                    return false;
                }break;
            case 6:
                if(!in_array($num,array('龙','虎','龙虎'))){
                    return false;
                }break;
        }
        return true;
    }
}