<?php
/**
 * Created by PhpStorm.
 * User: 34772
 * Date: 2017/4/17
 * Time: 15:48
 */

namespace Home\Controller;

class Number
{
    public static function num($number){
        if(strpos($number,',') !== false){
            $number = explode(',',$number);
        }elseif(strpos($number,'$') !== false){
            $number = explode('$',$number);
        }
        return $number;
    }
    public static function recombine($number,$id,$selectNum,$weiShu,$api,$type)
    {
        if($type == 1 || $type == 3){
            if($api == 1){
                $numbers = self::num($number);
            }else{
                $numbers = $number;
            }
            if($id == 2 || $id == 4 || $id == 6 || $id == 10 || $id == 303 || $id == 12 || $id == 25 || $id == 27 || $id == 57 || $id == 67 || $id == 69){
                $number = self::tzAllSelect($numbers,$selectNum,$api);
            } elseif($id == 3 || $id == 5 || $id == 7 || $id == 11 || $id == 302 || $id == 13 || $id == 26 || $id == 28 || $id == 32 || $id == 34 || $id == 58 || $id == 66 || $id == 68 || $id == 62 || $id == 64){
                $number = self::tzSscInput($numbers,$selectNum,$api);
            } elseif($id == 312 || $id == 318 || $id == 320 || $id == 322 || $id == 324 || $id == 16 || $id == 17 || $id == 304 || $id == 305 || $id == 19 || $id == 20 || $id == 31 || $id == 33 || $id == 39 || $id == 40 || $id == 38 || $id == 361 || $id == 59 || $id == 60 || $id == 63 || $id == 65 || $id == 71 || $id == 434 || $id == 435){
                $number = self::tzCombineSelect($numbers,$selectNum,$api);
            } elseif($id == 313){
                $number = self::tz5xzxSelect($numbers,1,3,$api);
            } elseif($id == 314){
                $number = self::tz5xzxSelect($numbers,2,1,$api);
            } elseif($id == 315 || $id == 319 || $id == 323){
                $number = self::tz5xzxSelect($numbers,1,2,$api);
            } elseif($id == 316 || $id == 317 || $id == 321 || $id == 325){
                $number = self::tz5xzxSelect($numbers,1,1,$api);
            } elseif($id == 308 || $id == 309 || $id == 310 || $id == 311){
                $number = self::wxqw($numbers,$selectNum,$api);
            } elseif($id == 332 || $id == 346 || $id == 353 || $id == 333 || $id == 334 || $id == 351 || $id == 352 || $id == 354 || $id == 355 || $id == 339 || $id == 340 || $id == 356 || $id == 357 || $id == 358 || $id == 359 || $id == 424 || $id == 428){
                $number = self::sxzxhz($numbers,$api);
            } elseif($id == 335 || $id == 336 || $id == 337 || $id == 341 || $id == 342){
                $number = self::sxzxkd($numbers,$api);
            } elseif($id == 18 || $id == 306 || $id == 21 || $id == 427){
                $number = self::tzSscHhzxInput($numbers,$selectNum,$api);
            } elseif($id == 37){
                $number = self::tz5xDwei($numbers,$selectNum,$api);
            } elseif($id == 142 || $id == 360 || $id == 143 || $id == 362 || $id == 363 || $id == 364){
                $number = self::sscBdwEm($numbers,$selectNum,$api);
            } elseif($id == 42 || $id == 43 || $id == 365 || $id == 366 || $id == 72 || $id == 433){
                $number = self::tzDXDS($numbers,1,$api);
            } elseif($id == 29 || $id == 14 || $id == 8){
                $number = self::sscRxFs($numbers,$selectNum,$api);
            } elseif($id == 30 || $id == 36){
                $number = self::sscRx2Ds($numbers,$selectNum,$weiShu,$api);
            } elseif($id == 15 || $id == 24){
                $number = self::sscRx3Ds($numbers,$selectNum,$weiShu,$api);
            } elseif($id == 9){
                $number = self::sscRx4Ds($numbers,$selectNum,$weiShu,$api);
            } elseif($id == 343 || $id == 338){
                $number = self::sscRxHz($numbers,$selectNum,$weiShu,$api);
            } elseif($id == 35 || $id == 22 || $id == 23){
                $number = self::sscRxZxFs($numbers,$selectNum,$weiShu,$api);
            } elseif($id == 425){
                $number = self::Z3DsInput($numbers,$selectNum,$api);
            } elseif($id == 429){
                $number = self::Sxqw($numbers,$api,6);
            } elseif($id == 430){
                $number = self::Sxqw($numbers,$api,7);
            } elseif($id == 431){
                $number = self::Sxqw($numbers,$api,8);
            } elseif($id == 432){
                $number = self::Sxqw($numbers,$api,9);
            }
        }elseif($type == 2){
            $number = Number11x5::recombine($number,$id,$selectNum,$weiShu,$api);
        }elseif($type == 9){
            $number = NumberK3::recombine($number,$id,$selectNum,$weiShu,$api);
        }elseif($type == 4){
            $number = NumberKlsf::recombine($number,$id,$selectNum,$weiShu,$api);
        }elseif($type == 6  || $type == 11){
            $number = NumberPk10::recombine($number,$id,$selectNum,$weiShu,$api);
        }elseif($type == 10){
            $number = Number28::recombine($number,$id,$api);
        }
        return $number;
    }
    public static function tzAllSelect($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
        }
        if(count($numbers) != $selectNum){
            return self::show_false(0,'提交数据出错，请重新投注',$api);
        }
        foreach($numbers as $k => $v){
            if($v == ''){
                return self::show_false(0,'号码不能为空，请重新投注',$api);
            }
            if(!self::check_num($v,1)){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            $number = implode(',',$numbers);
            return $number;
        }else{
            return true;
        }
    }
    public static function tzSscInput($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$numbers);
            foreach($numbers as $key=>$value){
                $num = explode(',',$value);
                if(count($num) != $selectNum){
                    return self::show_false(0,'输入号码不正确，请重新投注',$api);
                }
                foreach($num as $k=>$v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(strlen($v) != $selectNum){
                        return self::show_false(0,'输入号码不正确，请重新投注',$api);
                    }
                    $numbers[$k] = implode(',',str_split($v));
                }
                $number = implode('|',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(strlen($numbers) != $selectNum){
                    return self::show_false(0,'输入号码不正确，请重新投注',$api);
                }
                $number = implode(',',str_split($numbers));
            }
            return $number;
        }
    }
    public static function tzCombineSelect($numbers,$selectNum,$api){
        if(strlen($numbers)<$selectNum){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if(!self::check_num($numbers,1)){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if($api == 1){
            return $numbers;
        }else{
            return true;
        }
    }
    public static function tz5xzxSelect($numbers,$n,$m,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
        }
        if($numbers[0] == '' || $numbers[1] == ''){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if(strlen($numbers[0]) < $n || strlen($numbers[1]) < $m){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if(!self::check_num($numbers[0],1)){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if(!self::check_num($numbers[1],1)){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        $num1 = str_split($numbers[0]);
        $num2 = str_split($numbers[1]);
        foreach($num1 as $key => $value){
            foreach($num2 as $k => $v){
                if($value == $v){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
        }
        $number = implode(',',$numbers);
        if($api == 1){
            return $number;
        }else{
            return true;
        }
    }
    public static function wxqw($numbers,$selectNum,$api){
        if(strlen($numbers)<$selectNum){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if(!self::check_num($numbers,1)){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if($api == 1){
            return $numbers;
        }else{
            return true;
        }
    }
    public static function sxzxhz($numbers,$api){
        if($api == 0){
            $numbers = explode('$',$numbers);
            foreach($numbers as $k=>$v){
                if($v == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_num($v,2)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if($v == ''){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(!self::check_num($v,2)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
                $number = implode('$',$numbers);
            }else{
                if($numbers == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_num($numbers,2)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = $numbers;
            }
            return $number;
        }
    }
    public static function sxzxkd($numbers,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
            foreach($numbers as $k=>$v){
                if($v == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_num($v,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if($v == ''){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
                $number = implode(',',$numbers);
            }else{
                if($numbers == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = $numbers;
            }
            return $number;
        }

    }
    public static function tzSscHhzxInput($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
            foreach($numbers as $k=>$v){
                if(!self::check_num($v,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if($v == '' || strlen($v)!=$selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $vs = str_split($v);
                if($vs[0] == $vs[1] && $vs[1] == $vs[2]){
                    return self::show_false(0,'不能为豹子',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if($v == '' || strlen($v)!=$selectNum){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $vs = str_split($v);
                    if($vs[0] == $vs[1] && $vs[1] == $vs[2]){
                        return self::show_false(0,'不能为豹子',$api);
                    }
                }
                $number = implode(',',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if($numbers == '' || strlen($numbers)!=$selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $vs = str_split($numbers);
                if($vs[0] == $vs[1] && $vs[1] == $vs[2]){
                    return self::show_false(0,'不能为豹子',$api);
                }
                $number = $numbers;
            }
            return $number;
        }
    }
    public static function tz5xDwei($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
            $n = 0;
            foreach($numbers as $k => $v){
                if($v != '-'){
                    $n++;
                    $num = str_split($v);
                    foreach($num as $key => $value){
                        if(!self::check_num($value,1)){
                            return self::show_false(0,'提交号码出错，请重新投注',$api);
                        }
                    }
                }
            }
            if($n < $selectNum){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            return true;
        }else{
            $n = 0;
            foreach($numbers as $k => $v){
                if($v == ''){
                    $numbers[$k] = '-';
                }else{
                    $num = str_split($v);
                    foreach($num as $key => $value){
                        if(!self::check_num($value,1)){
                            return self::show_false(0,'提交号码出错，请重新投注',$api);
                        }
                    }
                    $n++;
                }
            }
            if($n < $selectNum){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            $number = implode(',',$numbers);
            return $number;
        }
    }
    public static function sscBdwEm($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode(' ',$numbers);
            if(count($numbers) < $selectNum){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            foreach($numbers as $k=>$v){
                if(!self::check_num($v,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(!self::check_num($numbers,1)){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            if(strlen($numbers)<$selectNum){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            $number = implode(' ',str_split($numbers));
            return $number;
        }
    }
    public static function tzDXDS($numbers,$n,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
        }
        foreach($numbers as $k=>$v){
            if($v == '' || strlen($v) < $n){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            if(!self::check_num($v,3)){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        $number = implode(',',$numbers);
        if($api == 1){
            return $number;
        }else{
            return true;
        }
    }
    public static function sscRxFs($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$numbers);
            $n = 0;
            foreach($numbers as $k=>$v){
                if($v != '-'){
                    $n++;
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
            }
            if($n != $selectNum){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            return true;
        }else{
            $n = 0;
            foreach($numbers as $k=>$v){
                if($v == ''){
                    $numbers[$k] = '-';
                }else{
                    $n++;
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
            }
            if($n != $selectNum){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            $number = implode(',',$numbers);
            return $number;
        }
    }
    public static function sscRx2Ds($numbers,$selectNum,$weiShu,$api){
        if($api == 0){
            $numbers = explode('|',$numbers);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                $n = 0;
                foreach($nums as $k=>$v){
                    if($v != '-'){
                        $n++;
                        if(!self::check_num($v,1)){
                            return self::show_false(0,'提交号码出错，请重新投注',$api);
                        }
                    }
                }
                if($n != $selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k=>$v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(strlen($v) != $selectNum){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $numbers[$k] = self::sscRx2DsCg($v,$weiShu);
                }
                $number = implode('|',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(strlen($numbers) != $selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = self::sscRx2DsCg($numbers,$weiShu);
            }
            return $number;
        }
    }
    public static function sscRx2DsCg($v,$weiShu){
        $vs = str_split($v);
        switch($weiShu){
            case 24:
                $s = implode(',',array($vs[0],$vs[1],'-','-','-'));break;
            case 20:
                $s = implode(',',array($vs[0],'-',$vs[1],'-','-'));break;
            case 18:
                $s = implode(',',array($vs[0],'-','-',$vs[1],'-'));break;
            case 17:
                $s = implode(',',array($vs[0],'-','-','-',$vs[1]));break;
            case 12:
                $s = implode(',',array('-',$vs[0],$vs[1],'-','-'));break;
            case 10:
                $s = implode(',',array('-',$vs[0],'-',$vs[1],'-'));break;
            case 9:
                $s = implode(',',array('-',$vs[0],'-','-',$vs[1]));break;
            case 6:
                $s = implode(',',array('-','-',$vs[0],$vs[1],'-'));break;
            case 5:
                $s = implode(',',array('-','-',$vs[0],'-',$vs[1]));break;
            case 3:
                $s = implode(',',array('-','-','-',$vs[0],$vs[1]));break;
            default:
                self::show_false(0,'提交位数出错，请重新投注',1);
        }
        return $s;
    }
    public static function sscRx3Ds($numbers,$selectNum,$weiShu,$api){
        if($api == 0){
            $numbers = explode('|',$numbers);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                $n = 0;
                foreach($nums as $k=>$v){
                    if($v != '-'){
                        $n++;
                        if(!self::check_num($v,1)){
                            return self::show_false(0,'提交号码出错，请重新投注',$api);
                        }
                    }
                }
                if($n != $selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k=>$v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(strlen($v) != $selectNum){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $numbers[$k] = self::sscRx3DsCg($v,$weiShu);
                }
                $number = implode('|',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(strlen($numbers) != $selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = self::sscRx3DsCg($numbers,$weiShu);
            }
            return $number;
        }
    }
    public static function sscRx3DsCg($v,$weiShu){
        $vs = str_split($v);
        switch($weiShu){
            case 28:
                $s = implode(',',array($vs[0],$vs[1],$vs[2],'-','-'));break;
            case 26:
                $s = implode(',',array($vs[0],$vs[1],'-',$vs[2],'-'));break;
            case 25:
                $s = implode(',',array($vs[0],$vs[1],'-','-',$vs[2]));break;
            case 22:
                $s = implode(',',array($vs[0],'-',$vs[1],$vs[2],'-'));break;
            case 21:
                $s = implode(',',array($vs[0],'-',$vs[1],'-',$vs[2]));break;
            case 19:
                $s = implode(',',array($vs[0],'-','-',$vs[1],$vs[2]));break;
            case 14:
                $s = implode(',',array('-',$vs[0],$vs[1],$vs[2],'-'));break;
            case 13:
                $s = implode(',',array('-',$vs[0],$vs[1],'-',$vs[2]));break;
            case 11:
                $s = implode(',',array('-',$vs[0],'-',$vs[1],$vs[2]));break;
            case 7:
                $s = implode(',',array('-','-',$vs[0],$vs[1],$vs[2]));break;
            default:
                self::show_false(0,'提交位数出错，请重新投注',1);
        }
        return $s;
    }
    public static function sscRx4Ds($numbers,$selectNum,$weiShu,$api){
        if($api == 0){
            $numbers = explode('|',$numbers);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                $n = 0;
                foreach($nums as $k=>$v){
                    if($v != '-'){
                        $n++;
                        if(!self::check_num($v,1)){
                            return self::show_false(0,'提交号码出错，请重新投注',$api);
                        }
                    }
                }
                if($n != $selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k=>$v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(strlen($v) != $selectNum){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $numbers[$k] = self::sscRx4DsCg($v,$weiShu);
                }
                $number = implode('|',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(strlen($numbers) != $selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = self::sscRx4DsCg($numbers,$weiShu);
            }
            return $number;
        }
    }
    public static function sscRx4DsCg($v,$weiShu){
        $vs = str_split($v);
        switch($weiShu){
            case 30:
                $s = implode(',',array($vs[0],$vs[1],$vs[2],$vs[3],'-'));break;
            case 29:
                $s = implode(',',array($vs[0],$vs[1],$vs[2],'-',$vs[3]));break;
            case 23:
                $s = implode(',',array($vs[0],'-',$vs[1],$vs[2],$vs[3]));break;
            case 15:
                $s = implode(',',array('-',$vs[0],$vs[1],$vs[2],$vs[3]));break;
            default:
                self::show_false(0,'提交位数出错，请重新投注',1);
        }
        return $s;
    }
    public static function sscRxHz($numbers,$selectNum,$weiShu,$api){
        if($api == 0){
            $numbers = explode('$',$numbers);
        }
        if(is_array($numbers)){
            foreach($numbers as $k => $v){
                if($v == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_num($v,2)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            $number = implode('$',$numbers);
        }else{
            if($numbers == ''){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            if(!self::check_num($numbers,2)){
                return self::show_false(0,'提交号码出错，请重新投注',$api);
            }
            $number = $numbers;
        }
        if($selectNum == 2){
            if(!in_array($weiShu,array(24,20,18,17,12,10,9,6,5,3))){
                return self::show_false(0,'提交位数出错，请重新投注',$api);
            }
        }elseif($selectNum == 3){
            if(!in_array($weiShu,array(28,26,25,22,21,19,14,13,11,7))){
                return self::show_false(0,'提交位数出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return $number;
        }else{
            return true;
        }
    }
    public static function sscRxZxFs($numbers,$selectNum,$weiShu,$api){
        if(strlen($numbers)<$selectNum){
            return self::show_false(0,'提交号码出错，请重新投注',$api);
        }
        if(!in_array($weiShu,array(28,26,25,24,22,21,20,19,18,17,14,13,12,11,10,9,7,6,5,3))){
            return self::show_false(0,'提交位数出错，请重新投注',$api);
        }
        if($api == 1){
            return $numbers;
        }else{
            return true;
        }

    }
    public static function Z3DsInput($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$numbers);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                if(count($nums)!=$selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
                if($nums[0] == $nums[1] && $nums[1] == $nums[2]){
                    return self::show_false(0,'不能为豹子',$api);
                }
                if($nums[0] != $nums[1] && $nums[1] != $nums[2] && $nums[0] != $nums[2]){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if($v == '' || strlen($v)!=$selectNum){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $vs = str_split($v);
                    if($vs[0] == $vs[1] && $vs[1] == $vs[2]){
                        return self::show_false(0,'不能为豹子',$api);
                    }
                    if($vs[0] != $vs[1] && $vs[1] != $vs[2] && $vs[0] != $vs[2]){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $numbers[$k] = implode(',',$vs);
                }
                $number = implode('|',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if($numbers == '' || strlen($numbers)!=$selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $vs = str_split($numbers);
                if($vs[0] == $vs[1] && $vs[1] == $vs[2]){
                    return self::show_false(0,'不能为豹子',$api);
                }
                if($vs[0] != $vs[1] && $vs[1] != $vs[2] && $vs[0] != $vs[2]){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = implode(',',$vs);
            }
            return $number;
        }
    }
    public static function Z6DsInput($numbers,$selectNum,$api){
        if($api == 0){
            $numbers = explode('|',$numbers);
            foreach($numbers as $key=>$value){
                $nums = explode(',',$value);
                if(count($nums)!=$selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                foreach($nums as $k=>$v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
                if($nums[0] == $nums[1] || $nums[1] == $nums[2] || $nums[0] == $nums[2]){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if(!self::check_num($v,1)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if($v == '' || strlen($v)!=$selectNum){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $vs = str_split($v);
                    if($vs[0] == $vs[1] || $vs[1] == $vs[2] || $vs[0] == $vs[2]){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    $numbers[$k] = implode(',',$vs);
                }
                $number = implode('|',$numbers);
            }else{
                if(!self::check_num($numbers,1)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if($numbers == '' || strlen($numbers)!=$selectNum){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $vs = str_split($numbers);
                if($vs[0] == $vs[1] || $vs[1] == $vs[2] || $vs[0] == $vs[2]){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = implode(',',$vs);
            }
            return $number;
        }
    }
    public static function Sxqw($numbers,$api,$n){
        if($api == 0){
            $numbers = explode('$',$numbers);
            foreach($numbers as $k=>$v){
                if($v == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_sxqw($v,$n)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
            }
            return true;
        }else{
            if(is_array($numbers)){
                foreach($numbers as $k => $v){
                    if($v == ''){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                    if(!self::check_sxqw($v,$n)){
                        return self::show_false(0,'提交号码出错，请重新投注',$api);
                    }
                }
                $number = implode('$',$numbers);
            }else{
                if($numbers == ''){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                if(!self::check_sxqw($numbers,$n)){
                    return self::show_false(0,'提交号码出错，请重新投注',$api);
                }
                $number = $numbers;
            }
            return $number;
        }
    }





    public static function show_false($status, $msg, $api)
    {
        if($api == 1){
            header('Access-Control-Allow-Origin: http://localhost:8100');
            header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
            header('Access-Control-Allow-Methods: GET, POST, PUT');
            header('Access-Control-Allow-Credentials: true');
            $res = [
                'status' => $status,
                'msg' => $msg,
            ];
            echo json_encode($res, JSON_UNESCAPED_UNICODE);
            exit;
        }else{
            return false;
        }
    }
    public static function check_num($num,$n)
    {
        $nums = mb_str_split($num);
        foreach($nums as $k=>$v){
            switch($n){
                case 1:
                    if(!in_array($v,array('0','1','2','3','4','5','6','7','8','9'))){
                        return false;
                    }break;
                case 2:
                    if(!in_array($v,array('0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'))){
                        return false;
                    }break;
                case 3:
                    if(!in_array($v,array('大','小','单','双'))){
                        return false;
                    }break;
            }
        }
        return true;
    }
    public static function check_sxqw($num,$n){
        switch($n){
            case 6:
                if(!in_array($num,array('000','001','002','010','011','012','020','021','022','100','101','102','110','111','112','120','121','122','200','201','202','210','211','212','220','221','222'))){
                    return false;
                }break;
            case 7:
                if(!in_array($num,array('小小小','小小大','小大小','小大大','大小小','大小大','大大小','大大大'))){
                    return false;
                }break;
            case 8:
                if(!in_array($num,array('质质质','质质合','质合质','质合合','合质质','合质合','合合质','合合合'))){
                    return false;
                }break;
            case 9:
                if(!in_array($num,array('奇奇奇','奇奇偶','奇偶奇','奇偶偶','偶奇奇','偶奇偶','偶偶奇','偶偶偶'))){
                    return false;
                }break;
        }
        return true;
    }
}