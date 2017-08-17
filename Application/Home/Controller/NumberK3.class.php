<?php
/**
 * Created by PhpStorm.
 * User: 34772
 * Date: 2017/4/24
 * Time: 13:52
 */
namespace Home\Controller;

class NumberK3
{
    public static function recombine($number,$id,$selectNum,$weiShu,$api){
        if($id == 407 || $id == 123){
            return self::BtBz($number,$selectNum,$api);
        }elseif($id == 408 || $id == 412){
            return self::BtDs($number,$selectNum,$api);
        }elseif($id == 409 || $id == 411){
            return self::BtDt($number,$selectNum,$api);
        }elseif($id == 413){
            return self::BtHz($number,$selectNum,$api,2);
        }elseif($id == 410){
            return self::ThDs($number,$selectNum,$api,1);
        }elseif($id == 118){
            return self::BtHz($number,$selectNum,$api,4);
        }elseif($id == 120){
            return self::SthDx($number,$selectNum,$api);
        }elseif($id == 119){
            if($number == ''){
                $number = '111,222,333,444,555,666';
            }
            return self::SthTx($number,$api,5);
        }elseif($id == 125){
            if($number == ''){
                $number = '123,234,345,456';
            }
            return self::SthTx($number,$api,6);
        }elseif($id == 121){
            return self::ThFx($number,$selectNum,$api);
        }elseif($id == 122){
            return self::ThDx($number,$selectNum,$api);
        }
    }
    public static function BtBz($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode(',',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            if(!self::check_num($v,1)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }
    public static function BtDs($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$number);
            foreach($numbers as $key=>$value){
                $num = explode(' ',$value);
                if(count($num) != $selectNum || count($num) > count(array_unique($num))){
                    return false;
                }
                foreach($num as $k=>$v){
                    if(!self::check_num($v,1)){
                        return false;
                    }
                }
            }
            return true;
        }else{
            $numbers = explode(',',$number);
            foreach($numbers as $key=>$value){
                $num = str_split($value);
                if(count($num) != $selectNum || count($num) > count(array_unique($num))){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
                foreach($num as $k=>$v){
                    if(!self::check_num($v,1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$num);
            }
            return implode('|',$numbers);
        }
    }
    public static function BtDt($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode('(',$number);
            $nums = explode(")",$numbers[1]);
            $Dm = explode(" ",$nums[0]);
            $Tm = explode(" ",$nums[1]);
            if(count($Dm) > $selectNum-1 || count($Tm) < $selectNum-1){
                return false;
            }
            if(!Number11x5::is_repeat2($Dm,$Tm)){
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
            if(count($Dm) > $selectNum-1 || count($Tm) < $selectNum-1){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            if(!Number11x5::is_repeat2($Dm,$Tm)){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            foreach($Dm as $k=>$v){
                if(!self::check_num($v,1)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            foreach($Tm as $k=>$v){
                if(!self::check_num($Tm[$k],1)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            $number = '('.implode(' ',$Dm).')'.implode(' ',$Tm);
            return $number;
        }
    }
    public static function BtHz($number,$selectNum,$api,$n){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode('$',$number);
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
    public static function ThDs($number,$selectNum,$api,$n){
        if($api == 0){
            $numbers = explode('|',$number);
            foreach($numbers as $key=>$value){
                $num = explode(' ',$value);
                if(count($num) != $selectNum){
                    return false;
                }
                if($n == 1){
                    if(($num[0] == $num[1] && $num[1] == $num[2]) || ($num[0] != $num[1] && $num[1] != $num[2])){
                        return false;
                    }
                }else{
                    if($num[0] != $num[1] || $num[1] != $num[2]){
                        return false;
                    }
                }
                foreach($num as $k=>$v){
                    if(!self::check_num($v,1)){
                        return false;
                    }
                }
            }
            return true;
        }else{
            $numbers = explode('$',$number);
            foreach($numbers as $key=>$value){
                $num = str_split($value);
                if(count($num) != $selectNum){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
                if($n == 1){
                    if(($num[0] == $num[1] && $num[1] == $num[2]) || ($num[0] != $num[1] && $num[1] != $num[2])){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }else{
                    if($num[0] != $num[1] || $num[1] != $num[2]){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                foreach($num as $k=>$v){
                    if(!self::check_num($v,1)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$num);
            }
            return implode('|',$numbers);
        }
    }
    public static function ThFx($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode(',',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            if(!self::check_num($v,3)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }
    public static function ThDx($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$number);
            if(count($numbers) != $selectNum){
                return false;
            }
            $num2 = explode(' ',$numbers[1]);
            foreach($num2 as $k=>$v){
                if(!self::check_num($v,1)){
                    return false;
                }
            }
            $num1 = explode(' ',$numbers[0]);
            foreach($num1 as $k=>$v){
                if(!self::check_num($v,7)){
                    return false;
                }
                if(!Number11x5::is_repeat2(str_split($v),$num2)){
                    return false;
                }
            }
            return true;
        }else{
            $numbers = explode('-',$number);
            if(count($numbers) != $selectNum){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            $num1 = explode(',',$numbers[0]);
            $num2 = explode(',',$numbers[1]);
            if(!Number11x5::is_repeat2($num1,$num2)){
                Number::show_false(0,'提交号码出错，请重新投注',1);
            }
            foreach($num1 as $k=>$v){
                $num1[$k] = $v.$v;
                if(!self::check_num($num1[$k],7)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            foreach($num2 as $k=>$v){
                if(!self::check_num($v,1)){
                    Number::show_false(0,'提交号码出错，请重新投注',1);
                }
            }
            $number = implode(' ',$num1).','.implode(' ',$num2);
            return $number;
        }
    }
    public static function SthDx($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$number);
        }else{
            $numbers = explode(',',$number);
        }
        if(count($numbers) < $selectNum){
            return Number::show_false(0,'提交号码出错，请重新投注',$api);
        }
        foreach($numbers as $k=>$v){
            if(strlen($v) == 1){
                $numbers[$k] = $v.$v.$v;
            }
            if(!self::check_num($numbers[$k],5)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }
    public static function SthTx($number,$api,$n){
        $numbers = explode(",",$number);
        if(count($numbers) != 6 && count($numbers) != 4){
            return Number::show_false(0,'提交号码出错，请重新投注1',$api);
        }
        foreach($numbers as $k=>$v){
            if(!self::check_num($v,$n)){
                return Number::show_false(0,'提交号码出错，请重新投注2',$api);
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
                if(!in_array($num,array('1','2','3','4','5','6'))){
                    return false;
                }break;
            case 2:
                if(!in_array($num,array('6','7','8','9','10','11','12','13','14','15'))){
                    return false;
                }break;
            case 3:
                if(!in_array($num,array('11*','22*','33*','44*','55*','66*'))){
                    return false;
                }break;
            case 4:
                if(!in_array($num,array('3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18'))){
                    return false;
                }break;
            case 5:
                if(!in_array($num,array('111','222','333','444','555','666'))){
                    return false;
                }break;
            case 6:
                if(!in_array($num,array('123','234','345','456'))){
                    return false;
                }break;
            case 7:
                if(!in_array($num,array('11','22','33','44','55','66'))){
                    return false;
                }break;
        }
        return true;
    }
}