<?php
/**
 * Created by PhpStorm.
 * User: 34772
 * Date: 2017/4/25
 * Time: 14:37
 */
namespace Home\Controller;

class NumberKlsf
{
    public static function recombine($number,$id,$selectNum,$weiShu,$api){
        if($id == 414){
            return self::SwSt($number,$selectNum,$api,1);
        }elseif($id == 415){
            return self::SwSt($number,$selectNum,$api,2);
        }elseif($id == 416 || $id == 418){
            return self::Lz($number,$selectNum,$api);
        }elseif($id == 417 || $id == 419 || $id == 420 || $id == 421 || $id == 422 || $id == 425){
            return self::SwSt($number,$selectNum,$api,3);
        }
    }
    public static function SwSt($number,$selectNum,$api,$n){
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
            if(!self::check_num($numbers[$k],$n)){
                return Number::show_false(0,'提交号码出错，请重新投注',$api);
            }
        }
        if($api == 1){
            return implode(' ',$numbers);
        }else{
            return true;
        }
    }
    public static function Lz($number,$selectNum,$api){
        if($api == 0){
            $numbers = explode(',',$number);
            if(count($numbers) != $selectNum){
                return false;
            }
            foreach($numbers as $key=>$value){
                $num = explode(' ',$value);
                foreach($num as $k=>$v){
                    if(!self::check_num($v,3)){
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
                    if(!self::check_num($num[$k],3)){
                        Number::show_false(0,'提交号码出错，请重新投注',1);
                    }
                }
                $numbers[$key] = implode(' ',$num);
            }
            return implode(',',$numbers);
        }
    }


    public static function check_num($num,$n){
        switch($n){
            case 1:
                if(!in_array($num,array('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18'))){
                    return false;
                }break;
            case 2:
                if(!in_array($num,array('19','20'))){
                    return false;
                }break;
            case 3:
                if(!in_array($num,array('01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20'))){
                    return false;
                }break;
        }
        return true;
    }
}