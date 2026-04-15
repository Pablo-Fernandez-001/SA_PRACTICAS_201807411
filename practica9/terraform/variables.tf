variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "project_name" {
  type        = string
  default     = "practica9"
  description = "Prefix para recursos"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.90.0.0/16"
  description = "CIDR de la VPC"
}

variable "subnet_cidr" {
  type        = string
  default     = "10.90.1.0/24"
  description = "CIDR de subnet publica"
}

variable "ami_id" {
  type        = string
  description = "AMI para VM"
}

variable "instance_type" {
  type        = string
  default     = "t3.small"
  description = "Tipo de VM"
}

variable "key_name" {
  type        = string
  description = "Nombre de llave SSH en AWS"
}
