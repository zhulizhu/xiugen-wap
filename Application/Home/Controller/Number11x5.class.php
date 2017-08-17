<?php
/**
 * Created by PhpStorm.
 * User: 34772
 * Date: 2017/4/21
 * Time: 9:52
 */
namespace Home\Controller;

class Number11x5
{
    public static function recombine($number,$id,$selectNum,$weiShu,$api){
        if($id == 55 || $id == 53){
            return self::ZxFs($number,$api);
        }elseif($id == 368 || $id == 370){
            return self::ZxDs($number,$selectNum,$api);
        }elseif($id == 56 || $id == 54 || $id ==379 || $id == 380 || $id == 384 || $id == 385 || $id == 386 || $id == 387 || $id == 388 || $id == 389 || $id == 390 || $id == 391){
            return self::ZuxFs($number,$selectNum,$api);
        }elseif($id == 369 || $id == 371 || $id == 392 || $id == 393 || $id == 394 || $id == 395 || $id == 396 || $id == 397 || $id == 398 || $id == 399){
            return self::ZxuDs($number,$selectNum,$api);
        }elseif($id == 367 || $id == 401){
            return self::ZxDt($number,$api,1,2);
        }elseif($id == 378 || $id == 400){
            return self::ZxDt($number,$api,1,1);
        }elseif($id == 402){
            return self::ZxDt($number,$api,1,3);
        }elseif($id == 403){
            return self::ZxDt($number,$api,1,4);
        }elseif($id == 404){
            return self::ZxDt($number,$api,1,5);
        }elseif($id == 405){
            return self::ZxDt($number,$api,1,6);
        }elseif($id == 406){
            return self::ZxDt($number,$api,1,7);
        }elseif($id == 381){
            return self::QsDwd($number,$api);
        }elseif($id == 382){
            return self::Dds($number,$selectNum,$api);
        }elseif($id == 383){
            return self::Czs($number,$selectNum,$api);
        }
    }
    public static function ZxFs($number,$api){
        if($api == 0){
            $numbers = explode(',',$number);
            foreach($numbers as $key=>$value){
                if($value == ''){
                    return false;
                }
                $nums = explode(' ',$value);
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        return false;
                    }
                }
            }
            if(count($numbers) == 3){
                if(!self::is_repeat3(explode(' ',$numbers[0]),explode(' ',$numbers[1]),explode(' ',$numbers[2]))){
                    return false;
                }
            }elseif(count($numbers) == 2){
                if(!self::is_repeat2(explode(' ',$numbers[0]),explode(' ',$numbers[1]))){
                    return false;
                }
            }
            return true;
        }else{
            $numbers = explode('-',$number);
            if(count($numbers) == 3){
                if(!self::is_repeat3(explode(',',$numbers[0]),explode(',',$numbers[1]),explode(',',$numbers[2]))){
                    Number::show_false(0,'不能有相同号码，请重新投注',1);
                }
            }elseif(count($numbers) == 2){
                if(!self::is_repeat2(explode(',',$numbers[0]),explode(',',$numbers[1]))){
                    Number::show_false(0,'不能有相同号码，请重新投注',1);
                }
            }
            foreach($numbers as $key=>$value){
                if($value == ''){
                    return false;
                }
                $nums = explode(',',$value);
                foreach($nums as $k=>$v){
                    $nums[$k] = self::add0($v);
                    if(!self::check_num($nums[$k],1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$nums);
            }
            $number = implode(',',$numbers);
            return $number;
        }
    }
    public static function ZxDs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$number);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                if(count($nums) != $selectNum){
                    return false;
                }
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        return false;
                    }
                }
            }
            return true;
        }else{
            $numbers = explode('$',$number);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                if(count($nums) != $selectNum){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
            }
            $number = implode('|',$numbers);
            return $number;
        }
    }
    public static function ZuxFs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode(',',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            $numbers[$k] = self::add0($v);
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
    public static function ZxuDs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$number);
            foreach($numbers as $key=>$value){
                $nums = explode(' ',$value);
                if(count($nums) != $selectNum){
                    return false;
                }
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        return false;
                    }
                }
            }
            return true;
        }else{
            $numbers = explode('$',$number);
            foreach($numbers as $key=>$value){
                if(strpos($value,',') !== false){
                    $nums = explode(',',$value);
                }elseif(strpos($value,' ') !== false){
                    $nums = explode(' ',$value);
                }
                if(count($nums) != $selectNum){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$nums);
            }
            $number = implode('|',$numbers);
            return $number;
        }
    }
    public static function ZxDt($number,$api,$n,$m){
        if($api == 0){
            $numbers = explode('(',$number);
            $nums = explode(")",$numbers[1]);
            $Dm = explode(" ",$nums[0]);
            $Tm = explode(" ",$nums[1]);
            if(count($Dm) < $n || count($Tm) < $m){
                return false;
            }
            if(!self::is_repeat2($Dm,$Tm)){
                return false;
            }
            foreach($Dm as $k=>$v){
                if(!self::check_num($v,1)){
                    return false;
                }
            }
            foreach($Tm as $k=>$v){
                if(!self::check_num($v,1)){
                    return false;
                }
            }
            return true;
        }else{
            $numbers = explode('-',$number);
            $Dm = explode(",",$numbers[0]);
            $Tm = explode(",",$numbers[1]);
            if(count($Dm) < $n || count($Tm) < $m){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            if(!self::is_repeat2($Dm,$Tm)){
                Number::show_false(0,'不能有相同号码，请重新投注',1);
            }
            foreach($Dm as $k=>$v){
                $Dm[$k] = self::add0($v);
                if(!self::check_num($Dm[$k],1)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            foreach($Tm as $k=>$v){
                $Tm[$k] = self::add0($v);
                if(!self::check_num($Tm[$k],1)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            $number = '('.implode(' ',$Dm).')'.implode(' ',$Tm);
            return $number;
        }
    }
    public static function QsDwd($number,$api){
        if($api == 0){
            $numbers = explode(',',$number);
            foreach($numbers as $key => $value){
                if($value == '-'){
                    continue;
                }else{
                    $nums = explode(" ",$value);
                    foreach($nums as $k => $v){
                        if(!self::check_num($v,1)){
                            return false;
                        }
                    }
                }
            }
            return true;
        }else{
            $numbers = explode('-',$number);
            foreach($numbers as $key => $value){
                $nums = explode(",",$value);
                foreach($nums as $k => $v){
                    $nums[$k] = self::add0($v);
                    if(!self::check_num($v,1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$nums);
            }
            $number = implode(",",$numbers);
            return $number;
        }
    }
    public static function Dds($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$number);
            if(count($numbers) < $selectNum){
                return false;
            }
            foreach($numbers as $k => $v){
                if(!self::check_num($v,2)){
                    return false;
                }
            }
            return true;
        }else{
            $numbers = explode(',',$number);
            if(count($numbers) < $selectNum){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            foreach($numbers as $k => $v){
                $numbers[$k] = self::addDs($v);
                if(!self::check_num($numbers[$k],2)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            $number = implode(",",$numbers);
            return $number;
        }
    }
    public static function Czs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode('$',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            $numbers[$k] = self::add0($v);
            if(!self::check_num($numbers[$k],3)){
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
                if(!in_array($num,array('01','02','03','04','05','06','07','08','09','10','11'))){
                    return false;
                }break;
            case 2:
                if(!in_array($num,array('5单0双','4单1双','3单2双','2单3双','1单4双','0单5双'))){
                    return false;
                }break;
            case 3:
                if(!in_array($num,array('03','04','05','06','07','08','09'))){
                    return false;
                }break;
        }
        return true;
    }
    public static function is_repeat2($m,$n){
        foreach($m as $key => $value){
            foreach($n as $k => $v){
                if($value == $v){
                    return false;
                }
            }
        }
        return true;
    }
    public static function is_repeat3($a,$b,$c){
        foreach($a as $key => $value){
            foreach($b as $ke => $va){
                foreach($c as $k => $v){
                    if($value == $va || $value == $v || $va == $v){
                        return false;
                    }
                }
            }
        }
        return true;
    }
    public static function add0($str){
        if(strlen($str) == 1){
            $str = '0'.$str;
        }
        return $str;
    }
    public static function addDs($n){
        switch($n){
            case '0':return '5单0双';break;
            case '1':return '4单1双';break;
            case '2':return '3单2双';break;
            case '3':return '2单3双';break;
            case '4':return '1单4双';break;
            case '5':return '0单5双';break;
            default:Number::show_false(0,'提交号码出错，请重新投注',1);
        }
    }
}
